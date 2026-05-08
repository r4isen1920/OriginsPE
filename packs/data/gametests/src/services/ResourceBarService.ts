import { Player, ScoreboardObjective, world } from '@minecraft/server';

import { RENDER_SB } from '../Constants';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/PlayerState';
import { OnWorldLoad } from '@bedrock-oss/stylish';


//#region TYPES

/** Channels the renderer pulls from. */
export type ResourceBarSlot = 1 | 2 | 3;

/**
 * One push request. Mirrors the legacy `ResourceBar(id, from, to, duration, persist)`
 * constructor and the `cd*` scoreboard fields it wrote.
 */
export interface ResourceBarPush {
	/** Numerical bar id from `textures/origins/hud/cooldown/`. */
	id: number;
	/** Start value 0..100. */
	from?: number;
	/** End value 0..100. */
	to?: number;
	/** Duration in seconds. */
	durationSeconds?: number;
	/** If true, the bar stays visible after duration ends. */
	persist?: boolean;
}


//#region SERVICE

/**
 * TS-side driver for the cooldown HUD. Replaces the entire
 * `BP/functions/r4isen1920_originspe/resource_bar/**` mcfunction tree and the
 * legacy `ResourceBar` class.
 *
 * Internally:
 * - Owns the `cd*` and `gui` scoreboard objectives required by the existing
 *   RP animation controllers (the renderer reads them via `q.scoreboard(...)`).
 * - Mirrors per-player cooldown bookkeeping onto dynamic properties via
 *   {@link PlayerState}, which is the source of truth for TS reads.
 * - Caches last-written scoreboard values per player to skip redundant writes.
 */
export class ResourceBarService {
	private static readonly log = Log.get('ResourceBarService');
	private static readonly cache = new Map<string, Map<string, number>>();
	private static initialized = false;


	//#region INIT

	/**
	 * Ensures every render-bridge scoreboard objective exists. Drops any
	 * legacy objectives we no longer use. Call once at world load.
	 */
	@OnWorldLoad
	static initialize(): void {
		if (this.initialized) return;
		this.initialized = true;

		// Ensure render objectives exist.
		for (const id of Object.values(RENDER_SB)) {
			this.objective(id);
		}

		// Constants table referenced by `q.scoreboard('var')` in animations.
		const varObj = this.objective(RENDER_SB.var);
		const constants: ReadonlyArray<[string, number]> = [
			['#0', 0], ['#1', 1], ['#3', 3], ['#6', 6], ['#9', 9],
			['#10', 10], ['#15', 15], ['#100', 100], ['#1000', 1000],
		];
		for (const [name, value] of constants) {
			try { varObj.setScore(name, value); } catch { /* ignore */ }
		}

		this.log.info('ResourceBarService initialized');
	}

	/** Marks the GUI as ready for the player (the renderer gates on this flag). */
	static markGuiReady(player: Player, ready: boolean): void {
		this.write(player, RENDER_SB.gui, ready ? 1 : 0);
	}


	//#region API

	/**
	 * Pushes a cooldown bar to the active channel. Mirrors the legacy
	 * `new ResourceBar(...).push(player)` flow.
	 */
	static push(player: Player, opts: ResourceBarPush): void {
		const from = opts.from ?? 0;
		const to = opts.to ?? 100;
		const duration = opts.durationSeconds ?? 1;
		const persist = opts.persist ?? false;

		this.write(player, RENDER_SB.cd, opts.id);
		this.write(player, RENDER_SB.cdFrom, from);
		this.write(player, RENDER_SB.cdTo, to);
		this.write(player, RENDER_SB.cdDuration, duration);
		this.write(player, RENDER_SB.cdPersist, persist ? 1 : 0);

		if (!persist) {
			// Mirror to DP cooldown table so TS code can gate on it.
			const TICKS_PER_SECOND = 20;
			PlayerState.for(player).setCooldown(
				`bar_${opts.id}`,
				/* currentTick: */ 0, // expiry calculated by callers via setCooldown(..., currentTick, ...)
				duration * TICKS_PER_SECOND,
			);
		}
	}

	/**
	 * Removes the bar with the given `id` from the renderer.
	 * Equivalent to the legacy `pop(player, id)` + `cdhide` write.
	 */
	static pop(player: Player, id: number): void {
		this.write(player, RENDER_SB.cdHide, id);
		PlayerState.for(player).clearCooldown(`bar_${id}`);
	}

	/** Clears every visible bar and every DP cooldown entry. */
	static clear(player: Player): void {
		this.write(player, RENDER_SB.cd1Duration, 0);
		this.write(player, RENDER_SB.cd2Duration, 0);
		this.write(player, RENDER_SB.cd3Duration, 0);
		PlayerState.for(player).clearAllCooldowns();
	}


	//#region INTERNAL

	private static objective(id: string): ScoreboardObjective {
		return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, id);
	}

	/** Cached scoreboard write; skips API call when value unchanged. */
	private static write(player: Player, objectiveId: string, value: number): void {
		let perPlayer = this.cache.get(player.id);
		if (!perPlayer) {
			perPlayer = new Map();
			this.cache.set(player.id, perPlayer);
		}
		if (perPlayer.get(objectiveId) === value) return;
		perPlayer.set(objectiveId, value);
		try {
			this.objective(objectiveId).setScore(player, value);
		} catch (e: any) {
			this.log.error(`write ${objectiveId}=${value}: ${e?.stack ?? e}`);
		}
	}

	/** Drops cached values for a player (call on leave). */
	static forget(playerId: string): void {
		this.cache.delete(playerId);
	}
}
