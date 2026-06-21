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
} from '../core/DecoratedEvents';
import { EntityUtils } from '../utils/EntityUtils';
import { AbilityDispatch } from '../domain/AbilityDispatch';
import { DamageOverride } from './Attributes';


//#region DAMAGE OVERRIDES

const damageOverrides: DamageOverride[] = [];
const playerDamageOverrides = new Map<string, readonly DamageOverride[]>();

/** Registers a {@link DamageOverride} evaluated on every player `entityHurt` before-event. */
export function registerDamageOverride(override: DamageOverride): void {
	damageOverrides.push(override);
}

/** Replaces the active per-player damage overrides used by the hurt handler. */
export function setDamageOverrides(player: Player, overrides: readonly DamageOverride[]): void {
	if (overrides.length === 0) {
		playerDamageOverrides.delete(player.id);
		return;
	}
	playerDamageOverrides.set(player.id, [...overrides]);
}

/** Drops any cached per-player damage overrides. Call on leave. */
export function forgetDamageOverrides(playerId: string): void {
	playerDamageOverrides.delete(playerId);
}


//#region SERVICE

/**
 * Single subscription point for combat events. Iterates the affected player's
 * granted powers/perks and dispatches to their lifecycle hooks. Replaces the
 * per-power `system.runInterval` + `entityHurt.subscribe` patterns from the
 * legacy code.
 */
export class DamageService {
	@BeforeEntityHurt()
	static onHurtBefore(ev: EntityHurtBeforeEvent): void {
		if (!EntityUtils.isPlayer(ev.hurtEntity)) return;

		const player = ev.hurtEntity;

		// Declarative overrides first.
		const activeOverrides = [...damageOverrides, ...(playerDamageOverrides.get(player.id) ?? [])];
		if (activeOverrides.length > 0) {
			let damage = ev.damage;
			for (const override of activeOverrides) {
				if (override.cause && override.cause !== ev.damageSource.cause) continue;
				if (override.when && !override.when(player, ev)) continue;
				if (override.multiplier !== undefined) damage *= override.multiplier;
				if (override.modifier !== undefined) damage += override.modifier;
			}
			if (damage !== ev.damage) ev.damage = Math.max(0, damage);
		}

		// Granted ability hooks may further adjust `ev.damage`.
		AbilityDispatch.toGranted(player, 'onHurtBefore', (a) => a.onHurtBefore?.(player, ev));
	}

	@AfterEntityHurt()
	static onHurt(ev: EntityHurtAfterEvent): void {
		if (EntityUtils.isPlayer(ev.hurtEntity)) {
			const victim = ev.hurtEntity;
			AbilityDispatch.toGranted(victim, 'onHurt', (a) => a.onHurt?.(victim, ev));
		}

		const attacker = ev.damageSource.damagingEntity;
		if (EntityUtils.isPlayer(attacker)) {
			AbilityDispatch.toGranted(attacker, 'onDealDamage', (a) => a.onDealDamage?.(attacker, ev));
		}
	}

	@AfterEntityHitEntity()
	static onHitEntity(ev: EntityHitEntityAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.damagingEntity)) return;
		const attacker = ev.damagingEntity;
		AbilityDispatch.toGranted(attacker, 'onAttack', (a) => a.onAttack?.(attacker, ev));
	}

	@AfterProjectileHitEntity()
	static onProjectileHit(ev: ProjectileHitEntityAfterEvent): void {
		const shooter = ev.source;
		if (!EntityUtils.isPlayer(shooter)) return;
		AbilityDispatch.toGrantedPowers(shooter, 'onProjectileHit', (a) => a.onProjectileHit?.(shooter, ev));
	}
}
