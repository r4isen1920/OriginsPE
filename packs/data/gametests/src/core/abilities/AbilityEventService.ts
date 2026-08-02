import {
	EffectAddAfterEvent,
	EntityDieAfterEvent,
	EntityHealthChangedAfterEvent,
	Player,
	PlayerBreakBlockAfterEvent,
	PlayerDimensionChangeAfterEvent,
	PlayerPlaceBlockAfterEvent,
} from '@minecraft/server';

import {
	AfterEffectAdd,
	AfterEntityDie,
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
		const player = ev.entity;
		if (!(player instanceof Player)) return;
		AbilityDispatch.toGranted(player, 'onHealthChange', (a, attrs) => a.onHealthChange?.(player, ev, attrs));
	}

	@AfterEffectAdd()
	static onEffectAdd(ev: EffectAddAfterEvent): void {
		const player = ev.entity;
		if (!(player instanceof Player)) return;
		AbilityDispatch.toGranted(player, 'onEffectAdd', (a, attrs) => a.onEffectAdd?.(player, ev, attrs));
	}

	@AfterPlayerDimensionChange()
	static onDimensionChange(ev: PlayerDimensionChangeAfterEvent): void {
		const player = ev.player;
		AbilityDispatch.toGranted(player, 'onDimensionChange', (a, attrs) => a.onDimensionChange?.(player, ev, attrs));
	}

	@AfterPlayerBreakBlock()
	static onBreakBlock(ev: PlayerBreakBlockAfterEvent): void {
		const player = ev.player;
		AbilityDispatch.toGranted(player, 'onBreakBlock', (a, attrs) => a.onBreakBlock?.(player, ev, attrs));
	}

	@AfterPlayerPlaceBlock()
	static onPlaceBlock(ev: PlayerPlaceBlockAfterEvent): void {
		const player = ev.player;
		AbilityDispatch.toGranted(player, 'onPlaceBlock', (a, attrs) => a.onPlaceBlock?.(player, ev, attrs));
	}

	@AfterEntityDie()
	static onDeath(ev: EntityDieAfterEvent): void {
		const player = ev.deadEntity;
		if (!(player instanceof Player)) return;
		AbilityDispatch.toGranted(player, 'onDeath', (a, attrs) => a.onDeath?.(player, ev, attrs));
	}
}
