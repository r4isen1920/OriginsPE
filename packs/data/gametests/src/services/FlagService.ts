import { Player } from '@minecraft/server';

import { NS } from '../Constants';
import { Log } from '../utils/Log';


//#region TYPES

/**
 * Generic, repurposable boolean actor-property flags exposed by the player BP
 * entity. They replace bespoke properties (e.g. the old `has_divine_aura`) so a
 * fixed, client-synced set can be reused by any script-driven visual/state.
 */
export type PlayerFlag = 'flag_a' | 'flag_b' | 'flag_c' | 'flag_d';


//#region SERVICE

/**
 * Thin abstraction over the player's generic boolean actor properties. Writes
 * go straight through `Player.setProperty`, so RP molang can read them via
 * `q.property('r4isen1920_originspe:flag_a')`.
 */
export class FlagService {
	private static readonly log = Log.get('FlagService');

	/** Sets a generic boolean flag on the player. */
	static set(player: Player, flag: PlayerFlag, value: boolean): void {
		try {
			player.setProperty(`${NS}:${flag}`, value);
		} catch (e: any) {
			this.log.error(`setProperty '${flag}' = ${value} failed: ${e?.stack ?? e}`);
		}
	}

	/** Reads a generic boolean flag from the player. Defaults to false. */
	static get(player: Player, flag: PlayerFlag): boolean {
		try {
			return player.getProperty(`${NS}:${flag}`) === true;
		} catch {
			return false;
		}
	}
}
