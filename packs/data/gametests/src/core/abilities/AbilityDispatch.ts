import { Player } from '@minecraft/server';
import { PlayerState } from '../platform/PlayerState';
import { Perk, Power } from './Ability';
import { PerkRegistry, PowerRegistry } from './Registries';
import { Log } from '../../utils/Log';


//#region DISPATCH

/**
 * Handles invoking ability hooks on a player's granted powers and perks.
 * This class is responsible for proper error handling and logging, so that faults in one ability don't affect others.
 */
export class AbilityDispatch {
	private static readonly log = Log.get('AbilityDispatch');

	/** Invokes a hook on every granted power and perk, isolating failures. */
	static toGranted(player: Player, hook: string, call: (ability: Power | Perk) => void): void {
		const state = PlayerState.for(player);
		for (const id of state.getPowers()) {
			this.invoke('Power', id, PowerRegistry.get(id), hook, call);
		}
		for (const id of state.getPerks()) {
			this.invoke('Perk', id, PerkRegistry.get(id), hook, call);
		}
	}

	/** Invokes a hook on granted powers only, isolating failures. */
	static toGrantedPowers(player: Player, hook: string, call: (ability: Power) => void): void {
		const state = PlayerState.for(player);
		for (const id of state.getPowers()) {
			this.invoke('Power', id, PowerRegistry.get(id), hook, call);
		}
	}

	/**
	 * Safely invokes a single ability hook, logging the faulting registry kind
	 * and id on failure. Returns silently when the ability is undefined.
	 */
	static invoke(
		kind: string,
		id: string,
		ability: Power | Perk | undefined,
		hook: string,
		call: (ability: any) => void,
	): void {
		if (!ability) return;
		try {
			call(ability);
		} catch (e: any) {
			this.log.error(`${kind} '${id}' threw in ${hook}: `, e);
		}
	}
}
