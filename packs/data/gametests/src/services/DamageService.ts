import {
	EntityDamageCause,
	EntityHurtAfterEvent,
	EntityHurtBeforeEvent,
	EntityHitEntityAfterEvent,
	Player,
	ProjectileHitEntityAfterEvent,
} from '@minecraft/server';

import {
	AfterEntityHitEntity,
	AfterEntityHurt,
	AfterProjectileHitEntity,
	BeforeEntityHurt,
} from '../core/platform/DecoratedEvents';
import { EntityUtils } from '../utils/EntityUtils';
import { AbilityDispatch } from '../core/abilities/AbilityDispatch';
import { DamageOverride } from './Attributes';
import { Log } from '../utils';



//#region SERVICE

/**
 * Handles damage-related events and dispatches them to granted powers and perks via {@link AbilityDispatch}.
 * This class intercepts damage received and dealt by players, allowing abilities to adjust or react to it.
 */
export default class DamageService {
	private static playerDamageOverrides = new Map<string, readonly DamageOverride[]>();
	private static readonly log = Log.get('DamageService');


	//#region Overrides

	/** Replaces the active per-player damage overrides used by the hurt handler. */
	public static setDamageOverrides(player: Player, overrides: readonly DamageOverride[], log: boolean = true): void {
		const current = this.playerDamageOverrides.get(player.id) ?? [];
		if (JSON.stringify(current) === JSON.stringify(overrides)) return;

		if (overrides.length === 0) {
			this.playerDamageOverrides.delete(player.id);
			if (log) this.log.debug(`Cleared damage overrides for player: ${player.name}`);
			return;
		}
		this.playerDamageOverrides.set(player.id, [...overrides]);
		if (log) this.log.debug(`Set ${overrides.length} damage overrides for player: ${player.name}`, overrides);
	}

	/** Drops any cached per-player damage overrides. Call on leave. */
	public static forgetDamageOverrides(playerId: string): void {
		this.playerDamageOverrides.delete(playerId);
	}


	//#region Handlers

	@BeforeEntityHurt()
	static onHurtBefore(ev: EntityHurtBeforeEvent): void {
		const player = ev.hurtEntity;
		if (!(player instanceof Player)) return;

		// If damage is through /kill command, ignore
		if (ev.damageSource.cause === EntityDamageCause.selfDestruct) return;

		const activeOverrides = this.playerDamageOverrides.get(player.id);
		if (activeOverrides && activeOverrides.length > 0) {
			let damage = ev.damage;
			for (const override of activeOverrides) {
				if (
					'cause' in override &&
					override.cause && override.cause !== ev.damageSource.cause
				) continue;
				if (
					'when' in override &&
					override.when && !override.when(player, ev)
				) continue;
				if (override.multiplier !== undefined) damage *= override.multiplier;
				if (override.modifier !== undefined) damage += override.modifier;
			}

			const dmg = Math.max(0, damage);
			if (dmg === 0) {
				this.log.debug(`Damage negated: ${ev.damage} HP, to: ${player.name}`);
				ev.cancel = true;
				return;
			}

			if (damage !== ev.damage) {
				this.log.debug(`Applied final damage: ${dmg} HP, from: ${ev.damage} HP, to: ${player.name}`);
				ev.damage = dmg;
			}
		}

		// Granted ability hooks may further adjust `ev.damage`.
		AbilityDispatch.toGranted(player, 'onHurtBefore', (a, attrs) => a.onHurtBefore?.(player, ev, attrs));
	}

	@AfterEntityHurt()
	static onHurt(ev: EntityHurtAfterEvent): void {
		const victim = ev.hurtEntity;
		if (victim instanceof Player) {
			AbilityDispatch.toGranted(victim, 'onHurt', (a, attrs) => a.onHurt?.(victim, ev, attrs));
		}

		const attacker = ev.damageSource.damagingEntity;
		if (attacker instanceof Player) {
			AbilityDispatch.toGranted(attacker, 'onDealDamage', (a, attrs) => a.onDealDamage?.(attacker, ev, attrs));
		}
	}

	@AfterEntityHitEntity()
	static onHitEntity(ev: EntityHitEntityAfterEvent): void {
		const attacker = ev.damagingEntity;
		if (!(attacker instanceof Player)) return;
		AbilityDispatch.toGranted(attacker, 'onAttack', (a, attrs) => a.onAttack?.(attacker, ev, attrs));
	}

	@AfterProjectileHitEntity()
	static onProjectileHit(ev: ProjectileHitEntityAfterEvent): void {
		const shooter = ev.source;
		if (!(shooter instanceof Player)) return;
		AbilityDispatch.toGrantedPowers(shooter, 'onProjectileHit', (a, attrs) => a.onProjectileHit?.(shooter, ev, attrs));
	}
}
