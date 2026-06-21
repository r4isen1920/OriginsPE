import { Player } from '@minecraft/server';

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
 * Handles generic boolean flags for the player. Provides a simple interface
 * for setting and getting flags, with error handling and logging.
 */
export class FlagService {
	private static readonly log = Log.get('FlagService');

	/** Sets a generic boolean flag on the player. */
	static set(player: Player, flag: PlayerFlag, value: boolean): void {
		try {
			player.setProperty(`r4isen1920_originspe:${flag}`, value);
		} catch (e: any) {
			this.log.error(`setProperty '${flag}' = ${value} failed: `, e);
		}
	}

	/** Reads a generic boolean flag from the player. Defaults to false. */
	static get(player: Player, flag: PlayerFlag): boolean {
		try {
			return player.getProperty(`r4isen1920_originspe:${flag}`) === true;
		} catch {
			return false;
		}
	}
}
