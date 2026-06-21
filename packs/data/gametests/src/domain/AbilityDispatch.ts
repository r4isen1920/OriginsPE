import { Player } from '@minecraft/server';
import { PlayerState } from '../core/PlayerState';
import { Perk, Power } from './Ability';
import { PerkRegistry, PowerRegistry } from './Registries';
import { Log } from '../utils/Log';


//#region DISPATCH

/**
 * Central, fault-isolated dispatch for ability lifecycle hooks. Every hook
 * invocation routed through here is wrapped so that a single misbehaving
 * power/perk cannot break the dispatch loop or its sibling abilities. The
 * faulting ability is logged by registry kind + id, so individual hook
 * implementations no longer need their own try/catch boilerplate.
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
