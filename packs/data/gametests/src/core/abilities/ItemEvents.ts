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
		if (!EntityUtils.isPlayer(ev.source)) return;
		const player = ev.source as Player;
		AbilityDispatch.toGranted(player, 'onItemUse', (a) => a.onItemUse?.(player, ev));
	}

	@BeforeItemUse()
	static onBeforeUse(ev: ItemUseBeforeEvent): void {
		if (!EntityUtils.isPlayer(ev.source)) return;
		const player = ev.source as Player;
		AbilityDispatch.toGranted(player, 'onBeforeItemUse', (a) => a.onBeforeItemUse?.(player, ev));
	}

	@AfterItemCompleteUse()
	static onCompleteUse(ev: ItemCompleteUseAfterEvent): void {
		if (!EntityUtils.isPlayer(ev.source)) return;
		const player = ev.source as Player;
		AbilityDispatch.toGranted(player, 'onItemCompleteUse', (a) => a.onItemCompleteUse?.(player, ev));
	}
}
