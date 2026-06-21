import {
	EffectAddAfterEvent,
	EntityHealthChangedAfterEvent,
	PlayerBreakBlockAfterEvent,
	PlayerDimensionChangeAfterEvent,
	PlayerPlaceBlockAfterEvent,
} from '@minecraft/server';

import {
	AfterEffectAdd,
	AfterEntityHealthChanged,
	AfterPlayerBreakBlock,
	AfterPlayerDimensionChange,
	AfterPlayerPlaceBlock,
} from '../core/DecoratedEvents';
import { EntityUtils } from '../utils/EntityUtils';
import { AbilityDispatch } from '../domain/AbilityDispatch';


//#region SERVICE

/**
 * Single subscription point for the owner-centric world events that are not
 * already handled by {@link DamageService} or the item dispatcher. Iterates
 * the affected player's granted powers/perks and dispatches to their lifecycle
 * hooks, so individual abilities never subscribe to world events directly and
 * carry no origin/class coupling.
 */
export class AbilityEventService {
	@AfterEntityHealthChanged()
	static onHealthChanged(ev: EntityHealthChangedAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.entity)) return;
		const player = ev.entity;
		AbilityDispatch.toGranted(player, 'onHealthChange', (a) => a.onHealthChange?.(player, ev));
	}

	@AfterEffectAdd()
	static onEffectAdd(ev: EffectAddAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.entity)) return;
		const player = ev.entity;
		AbilityDispatch.toGranted(player, 'onEffectAdd', (a) => a.onEffectAdd?.(player, ev));
	}

	@AfterPlayerDimensionChange()
	static onDimensionChange(ev: PlayerDimensionChangeAfterEvent): void {
		const player = ev.player;
		AbilityDispatch.toGranted(player, 'onDimensionChange', (a) => a.onDimensionChange?.(player, ev));
	}

	@AfterPlayerBreakBlock()
	static onBreakBlock(ev: PlayerBreakBlockAfterEvent): void {
		const player = ev.player;
		AbilityDispatch.toGranted(player, 'onBreakBlock', (a) => a.onBreakBlock?.(player, ev));
	}

	@AfterPlayerPlaceBlock()
	static onPlaceBlock(ev: PlayerPlaceBlockAfterEvent): void {
		const player = ev.player;
		AbilityDispatch.toGranted(player, 'onPlaceBlock', (a) => a.onPlaceBlock?.(player, ev));
	}
}
