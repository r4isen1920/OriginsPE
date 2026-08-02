import { Player } from '@minecraft/server';
import { PlayerState } from '../platform/PlayerState';
import { Perk, Power } from './Ability';
import { PerkRegistry, PowerRegistry } from './Registries';
import { AttributeService, type AttributeSourceInstance } from '../../services/AttributeService';
import { Log } from '../../utils/Log';


//#region DISPATCH

/**
 * Handles invoking ability hooks on a player's granted powers and perks.
 * This class is responsible for proper error handling and logging, so that faults in one ability don't affect others.
 */
export class AbilityDispatch {
	private static readonly log = Log.get('AbilityDispatch');

	/** Source id owned by an ability, shared by its unconditional attributes and its dynamic handle. */
	static sourceIdFor(kind: string, id: string): string {
		return `${kind.toLowerCase()}:${id}`;
	}

	/** Invokes a hook on every granted power and perk, isolating failures. */
	static toGranted(player: Player, hook: string, call: (ability: Power | Perk, attributes: AttributeSourceInstance) => void): void {
		const state = PlayerState.for(player);
		for (const id of state.getPowers()) {
			this.invoke(player, 'Power', id, PowerRegistry.get(id), hook, call);
		}
		for (const id of state.getPerks()) {
			this.invoke(player, 'Perk', id, PerkRegistry.get(id), hook, call);
		}
	}

	/** Invokes a hook on granted powers only, isolating failures. */
	static toGrantedPowers(player: Player, hook: string, call: (ability: Power, attributes: AttributeSourceInstance) => void): void {
		const state = PlayerState.for(player);
		for (const id of state.getPowers()) {
			this.invoke(player, 'Power', id, PowerRegistry.get(id), hook, call);
		}
	}

	/**
	 * Safely invokes a single ability hook, logging the faulting registry kind
	 * and id on failure. Returns silently when the ability is undefined.
	 * The ability's dynamic attribute handle is passed to the callback.
	 */
	static invoke(
		player: Player,
		kind: string,
		id: string,
		ability: Power | Perk | undefined,
		hook: string,
		call: (ability: any, attributes: AttributeSourceInstance) => void,
	): void {
		if (!ability) return;
		try {
			call(ability, AttributeService.source(player, this.sourceIdFor(kind, id)));
		} catch (e: any) {
			this.log.error(`${kind} '${id}' threw in ${hook}: `, e);
		}
	}
}
