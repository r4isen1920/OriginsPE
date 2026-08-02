import {
	ItemCompleteUseAfterEvent,
	ItemUseAfterEvent,
	ItemUseBeforeEvent,
	Player,
} from '@minecraft/server';

import {
	AfterItemCompleteUse,
	AfterItemUse,
	BeforeItemUse,
} from '../platform/DecoratedEvents';
import { EntityUtils } from '../../utils/EntityUtils';
import { AbilityDispatch } from './AbilityDispatch';


//#region DISPATCHER

/**
 * Handles how custom items behave.
 */
export class ItemEvents {
	@AfterItemUse()
	static onUse(ev: ItemUseAfterEvent): void {
		const player = ev.source;
		if (!(player instanceof Player)) return;
		AbilityDispatch.toGranted(player, 'onItemUse', (a, attrs) => a.onItemUse?.(player, ev, attrs));
	}

	@BeforeItemUse()
	static onBeforeUse(ev: ItemUseBeforeEvent): void {
		const player = ev.source;
		if (!(player instanceof Player)) return;
		AbilityDispatch.toGranted(player, 'onBeforeItemUse', (a, attrs) => a.onBeforeItemUse?.(player, ev, attrs));
	}

	@AfterItemCompleteUse()
	static onCompleteUse(ev: ItemCompleteUseAfterEvent): void {
		const player = ev.source;
		if (!(player instanceof Player)) return;
		AbilityDispatch.toGranted(player, 'onItemCompleteUse', (a, attrs) => a.onItemCompleteUse?.(player, ev, attrs));
	}
}
