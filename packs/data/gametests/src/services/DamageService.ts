import {
	EntityHurtAfterEvent,
	EntityHitEntityAfterEvent,
	ProjectileHitEntityAfterEvent,
} from '@minecraft/server';

import {
	AfterEntityHitEntity,
	AfterEntityHurt,
	AfterProjectileHitEntity,
} from '../core/DecoratedEvents';
import { EntityUtils } from '../utils/EntityUtils';
import { PlayerState } from '../core/PlayerState';
import { PowerRegistry, PerkRegistry } from '../domain/Registries';


//#region SERVICE

/**
 * Single subscription point for combat events. Iterates the affected player's
 * granted powers/perks and dispatches to their lifecycle hooks. Replaces the
 * per-power `system.runInterval` + `entityHurt.subscribe` patterns from the
 * legacy code.
 */
export class DamageService {

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
