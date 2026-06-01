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
import { PlayerState } from '../core/PlayerState';
import { PowerRegistry, PerkRegistry } from '../domain/Registries';
import { Log } from '../utils/Log';


//#region DAMAGE OVERRIDES

/**
 * Script-side replacement for the `minecraft:damage_sensor` component. An
 * override conditionally rescales the incoming damage of a hurt player before
 * it is applied. Multiplier is applied first, then the flat modifier.
 */
export interface DamageOverride {
	/** Stable id, used for logging/de-duplication. */
	readonly id: string;
	/** Optional damage-cause filter. When set, only matches this cause. */
	readonly cause?: EntityDamageCause;
	/** Optional predicate gating the override (e.g. on granted powers). */
	when?(player: Player, ev: EntityHurtBeforeEvent): boolean;
	/** Damage multiplier (applied before {@link DamageOverride.modifier}). */
	readonly multiplier?: number;
	/** Flat damage modifier added after the multiplier. */
	readonly modifier?: number;
}

const damageOverrides: DamageOverride[] = [];

/** Registers a {@link DamageOverride} evaluated on every player `entityHurt` before-event. */
export function registerDamageOverride(override: DamageOverride): void {
	damageOverrides.push(override);
}


//#region SERVICE

/**
 * Single subscription point for combat events. Iterates the affected player's
 * granted powers/perks and dispatches to their lifecycle hooks. Replaces the
 * per-power `system.runInterval` + `entityHurt.subscribe` patterns from the
 * legacy code.
 */
export class DamageService {
	private static readonly log = Log.get('DamageService');

	@BeforeEntityHurt()
	static onHurtBefore(ev: EntityHurtBeforeEvent): void {
		if (damageOverrides.length === 0) return;
		if (!EntityUtils.isPlayer(ev.hurtEntity)) return;

		const player = ev.hurtEntity;
		let damage = ev.damage;
		for (const override of damageOverrides) {
			if (override.cause && override.cause !== ev.damageSource.cause) continue;
			if (override.when && !override.when(player, ev)) continue;
			if (override.multiplier !== undefined) damage *= override.multiplier;
			if (override.modifier !== undefined) damage += override.modifier;
		}
		if (damage !== ev.damage) ev.damage = Math.max(0, damage);
	}

	@AfterEntityHurt()
	static onHurt(ev: EntityHurtAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.hurtEntity)) return;
		const state = PlayerState.for(ev.hurtEntity);
		for (const id of state.getPowers()) {
			PowerRegistry.get(id)?.onHurt?.(ev.hurtEntity, ev);
		}
		for (const id of state.getPerks()) {
			PerkRegistry.get(id)?.onHurt?.(ev.hurtEntity, ev);
		}
	}

	@AfterEntityHitEntity()
	static onHitEntity(ev: EntityHitEntityAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.damagingEntity)) return;
		const state = PlayerState.for(ev.damagingEntity);
		for (const id of state.getPowers()) {
			PowerRegistry.get(id)?.onAttack?.(ev.damagingEntity, ev);
		}
		for (const id of state.getPerks()) {
			PerkRegistry.get(id)?.onAttack?.(ev.damagingEntity, ev);
		}
	}

	@AfterProjectileHitEntity()
	static onProjectileHit(ev: ProjectileHitEntityAfterEvent): void {
		const shooter = ev.source;
		if (!EntityUtils.isPlayer(shooter)) return;
		const state = PlayerState.for(shooter);
		for (const id of state.getPowers()) {
			PowerRegistry.get(id)?.onProjectileHit?.(shooter, ev);
		}
	}
}
