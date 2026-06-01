import { Player } from '@minecraft/server';

import { DPK } from '../Constants';
import { Log } from '../utils/Log';


//#region TYPES

/** JSON-encoded record of cooldown id -> tick at which the cooldown expires. */
type CooldownMap = Record<string, number>;
/** JSON-encoded record of arbitrary transient flags. */
type FlagMap = Record<string, boolean | number | string>;

interface CachedState {
	origin: string | undefined;
	class: string | undefined;
	powers: string[];
	perks: string[];
	controls: string[];
	cooldowns: CooldownMap;
	flags: FlagMap;
	welcomed: boolean;
	recordVersion: string | undefined;
}


//#region PLAYERSTATE

/**
 * Centralized, cached, dynamic-property-backed state for a single player.
 *
 * - One instance per `Player.id`, lazily created via {@link PlayerState.for}.
 * - All reads come from the in-memory cache; writes are persisted to dynamic
 *   properties immediately.
 * - Replaces every `player.getTags().find(t => t.startsWith('race_'))` and
 *   `removeTags(player, '_')` pattern from the legacy code.
 */
export class PlayerState {
	private static readonly log = Log.get('PlayerState');
	private static readonly registry = new Map<string, PlayerState>();

	private constructor(
		public readonly player: Player,
		private readonly state: CachedState,
	) {}


	//#region FACTORY

	/** Returns (and lazily hydrates) the state object for `player`. */
	static for(player: Player): PlayerState {
		const existing = this.registry.get(player.id);
		if (existing && existing.player.isValid) return existing;

		const state: CachedState = {
			origin: this.readString(player, DPK.origin),
			class: this.readString(player, DPK.class),
			powers: this.readJsonArray(player, DPK.powers),
			perks: this.readJsonArray(player, DPK.perks),
			controls: this.readJsonArray(player, DPK.controls),
			cooldowns: this.readJsonObject(player, DPK.cooldowns),
			flags: this.readJsonObject(player, DPK.flags),
			welcomed: this.readBoolean(player, DPK.welcomed),
			recordVersion: this.readString(player, DPK.recordVersion),
		};
		const inst = new PlayerState(player, state);
		this.registry.set(player.id, inst);
		return inst;
	}

	/** Forgets the cache entry for the given player. Called on leave. */
	static release(playerId: string): void {
		this.registry.delete(playerId);
	}


	//#region ORIGIN / CLASS

	getOrigin(): string | undefined { return this.state.origin; }

	setOrigin(originId: string | undefined): void {
		this.state.origin = originId;
		this.writeString(DPK.origin, originId);
	}

	getClass(): string | undefined { return this.state.class; }

	setClass(classId: string | undefined): void {
		this.state.class = classId;
		this.writeString(DPK.class, classId);
	}


	//#region POWERS / PERKS / CONTROLS

	getPowers(): readonly string[] { return this.state.powers; }
	setPowers(ids: readonly string[]): void {
		this.state.powers = [...ids];
		this.writeJson(DPK.powers, this.state.powers);
	}

	getPerks(): readonly string[] { return this.state.perks; }
	setPerks(ids: readonly string[]): void {
		this.state.perks = [...ids];
		this.writeJson(DPK.perks, this.state.perks);
	}

	getControls(): readonly string[] { return this.state.controls; }
	setControls(ids: readonly string[]): void {
		this.state.controls = [...ids];
		this.writeJson(DPK.controls, this.state.controls);
	}

	hasPower(id: string): boolean { return this.state.powers.includes(id); }
	hasPerk(id: string): boolean { return this.state.perks.includes(id); }
	hasControl(id: string): boolean { return this.state.controls.includes(id); }


	//#region COOLDOWNS

	/** Returns the tick at which `id` expires, or 0 if not on cooldown. */
	getCooldownExpiry(id: string): number {
		return this.state.cooldowns[id] ?? 0;
	}

	/** Returns true if `id` is currently cooling down. */
	isOnCooldown(id: string, currentTick: number): boolean {
		const exp = this.state.cooldowns[id];
		return exp !== undefined && exp > currentTick;
	}

	/** Sets a cooldown to expire `durationTicks` from `currentTick`. */
	setCooldown(id: string, currentTick: number, durationTicks: number): void {
		this.state.cooldowns[id] = currentTick + durationTicks;
		this.writeJson(DPK.cooldowns, this.state.cooldowns);
	}

	/** Removes a cooldown entry. */
	clearCooldown(id: string): void {
		if (this.state.cooldowns[id] === undefined) return;
		delete this.state.cooldowns[id];
		this.writeJson(DPK.cooldowns, this.state.cooldowns);
	}

	/** Drops every cooldown entry (e.g. on origin change). */
	clearAllCooldowns(): void {
		this.state.cooldowns = {};
		this.writeJson(DPK.cooldowns, this.state.cooldowns);
	}


	//#region FLAGS

	getFlag<T extends boolean | number | string>(name: string): T | undefined {
		return this.state.flags[name] as T | undefined;
	}

	setFlag(name: string, value: boolean | number | string | undefined): void {
		if (value === undefined) {
			if (this.state.flags[name] === undefined) return;
			delete this.state.flags[name];
		} else {
			this.state.flags[name] = value;
		}
		this.writeJson(DPK.flags, this.state.flags);
	}

	/** Removes every flag whose name starts with `prefix`. */
	clearFlagPrefix(prefix: string): void {
		let mutated = false;
		for (const key of Object.keys(this.state.flags)) {
			if (key.startsWith(prefix)) {
				delete this.state.flags[key];
				mutated = true;
			}
		}
		if (mutated) this.writeJson(DPK.flags, this.state.flags);
	}


	//#region MISC

	isWelcomed(): boolean { return this.state.welcomed; }
	setWelcomed(value: boolean): void {
		this.state.welcomed = value;
		this.player.setDynamicProperty(DPK.welcomed, value);
	}

	getRecordVersion(): string | undefined { return this.state.recordVersion; }
	setRecordVersion(version: string | undefined): void {
		this.state.recordVersion = version;
		this.writeString(DPK.recordVersion, version);
	}

	/** Wipes all OriginsPE-managed dynamic properties for this player. */
	reset(): void {
		this.state.origin = undefined;
		this.state.class = undefined;
		this.state.powers = [];
		this.state.perks = [];
		this.state.controls = [];
		this.state.cooldowns = {};
		this.state.flags = {};
		this.state.welcomed = false;
		this.state.recordVersion = undefined;
		for (const key of Object.values(DPK)) {
			this.player.setDynamicProperty(key, undefined);
		}
	}


	//#region IO HELPERS

	private writeString(key: string, value: string | undefined): void {
		this.player.setDynamicProperty(key, value);
	}

	private writeJson(key: string, value: unknown): void {
		try {
			this.player.setDynamicProperty(key, JSON.stringify(value));
		} catch (e: any) {
			PlayerState.log.error(`Failed to write ${key}: ${e?.stack ?? e}`);
		}
	}

	private static readString(player: Player, key: string): string | undefined {
		const raw = player.getDynamicProperty(key);
		return typeof raw === 'string' ? raw : undefined;
	}

	private static readBoolean(player: Player, key: string): boolean {
		return player.getDynamicProperty(key) === true;
	}

	private static readJsonArray(player: Player, key: string): string[] {
		const raw = player.getDynamicProperty(key);
		if (typeof raw !== 'string') return [];
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
		} catch { return []; }
	}

	private static readJsonObject<T extends object>(player: Player, key: string): T {
		const raw = player.getDynamicProperty(key);
		if (typeof raw !== 'string') return {} as T;
		try {
			const parsed = JSON.parse(raw);
			return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as T : {} as T;
		} catch { return {} as T; }
	}
}
