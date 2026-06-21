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
} from '../platform/DecoratedEvents';
import { EntityUtils } from '../../utils/EntityUtils';
import { AbilityDispatch } from './AbilityDispatch';


//#region SERVICE

/**
 * Hooks events relevant to abilities and dispatches them to granted powers and perks via {@link AbilityDispatch}.	
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
