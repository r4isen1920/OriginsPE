import { Player } from '@minecraft/server';

import { PLAYER_DYNAMIC_PROPERTIES, PLAYER_STATE_TAG_PREFIXES } from '../../Constants';
import { Log } from '../../utils/Log';



//#region TYPES

/** JSON-encoded record of cooldown id -> tick at which the cooldown expires. */
type CooldownMap = Record<string, number>;
/** JSON-encoded record of arbitrary transient flags. */
type FlagMap = Record<string, boolean | number | string>;

/** Describes a curated cached state for this player */
interface CachedState {
	origin: string | undefined;
	class: string | undefined;
	powers: string[];
	perks: string[];
	cooldowns: CooldownMap;
	flags: FlagMap;
	welcomed: boolean;
	recordVersion: string | undefined;
}



//#region PlayerState
/**
 * Handles the current state of a player in key-value pairs. 
 * A state is cached per-player, and is persisted to the player's dynamic properties.
 * 
 * This class is simply a wrapper, cache layer, surrounding the player's dynamic properties.
 * It is recommended to use this class instead of directly reading/writing dynamic properties, as it provides a more structured and type-safe interface.
 */
export class PlayerState {
	private static readonly log = Log.get('PlayerState');
	private static readonly registry = new Map<string, PlayerState>();

	/** Please use the {@link PlayerState.for `PlayerState.for(player: Player)`} method to retrieve an instance. */
	private constructor(
		public readonly player: Player,
		private readonly state: CachedState
	) {}


	/** Initializes and retrieves the PlayerState for the given `player`. */
	static for(player: Player): PlayerState {
		const existing = this.registry.get(player.id);
		if (existing && existing.player.isValid) return existing;

		const state: CachedState = {
			origin: this.readString(player, PLAYER_DYNAMIC_PROPERTIES.origin),
			class: this.readString(player, PLAYER_DYNAMIC_PROPERTIES.class),
			powers: this.readJsonArray(player, PLAYER_DYNAMIC_PROPERTIES.powers),
			perks: this.readJsonArray(player, PLAYER_DYNAMIC_PROPERTIES.perks),
			cooldowns: this.readJsonObject(player, PLAYER_DYNAMIC_PROPERTIES.cooldowns),
			flags: this.readJsonObject(player, PLAYER_DYNAMIC_PROPERTIES.flags),
			welcomed: this.readBoolean(player, PLAYER_DYNAMIC_PROPERTIES.welcomed),
			recordVersion: this.readString(player, PLAYER_DYNAMIC_PROPERTIES.recordVersion)
		};
		const inst = new PlayerState(player, state);
		this.registry.set(player.id, inst);
		inst.syncAllTags();
		return inst;
	}

	/** Forgets the cache entry for the given player. Called on leave. */
	static release(playerId: string): void {
		this.registry.delete(playerId);
	}


	//#region API
	/** Retrieves this player's current Origin. */
	getOrigin(): string | undefined {
		return this.state.origin;
	}

	/** Sets this player's current Origin. */
	setOrigin(originId: string | undefined): void {
		this.state.origin = originId;
		this.writeString(PLAYER_DYNAMIC_PROPERTIES.origin, originId);
		this.syncTag(PLAYER_STATE_TAG_PREFIXES.origin, originId);
	}

	/** Retrieves this player's current Class. */
	getClass(): string | undefined {
		return this.state.class;
	}

	/** Sets this player's current Class. */
	setClass(classId: string | undefined): void {
		this.state.class = classId;
		this.writeString(PLAYER_DYNAMIC_PROPERTIES.class, classId);
		this.syncTag(PLAYER_STATE_TAG_PREFIXES.class, classId);
	}

	/** Retrieves this player's current Powers. Powers are Origin traits. */
	getPowers(): readonly string[] {
		return this.state.powers;
	}
	/** Sets this player's current Powers. Powers are Origin traits. */
	setPowers(ids: readonly string[]): void {
		this.state.powers = [...ids];
		this.writeJson(PLAYER_DYNAMIC_PROPERTIES.powers, this.state.powers);
		this.syncTagSet(PLAYER_STATE_TAG_PREFIXES.power, this.state.powers);
	}

	/** Retrieves this player's current Perks. Perks are Class traits. */
	getPerks(): readonly string[] {
		return this.state.perks;
	}
	/** Sets this player's current Perks. Perks are Class traits. */
	setPerks(ids: readonly string[]): void {
		this.state.perks = [...ids];
		this.writeJson(PLAYER_DYNAMIC_PROPERTIES.perks, this.state.perks);
		this.syncTagSet(PLAYER_STATE_TAG_PREFIXES.perk, this.state.perks);
	}

	/** Returns true if the player has the specified Power. */
	hasPower(id: string): boolean {
		return this.state.powers.includes(id);
	}
	/** Returns true if the player has the specified Perk. */
	hasPerk(id: string): boolean {
		return this.state.perks.includes(id);
	}

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
		this.writeJson(PLAYER_DYNAMIC_PROPERTIES.cooldowns, this.state.cooldowns);
	}

	/** Removes a cooldown entry. */
	clearCooldown(id: string): void {
		if (this.state.cooldowns[id] === undefined) return;
		delete this.state.cooldowns[id];
		this.writeJson(PLAYER_DYNAMIC_PROPERTIES.cooldowns, this.state.cooldowns);
	}

	/** Drops every cooldown entry (e.g. on origin change). */
	clearAllCooldowns(): void {
		this.state.cooldowns = {};
		this.writeJson(PLAYER_DYNAMIC_PROPERTIES.cooldowns, this.state.cooldowns);
	}

	/** Retrieves the value of a flag with the given name. Returns `undefined` if the flag is not set. */
	getFlag<T extends boolean | number | string>(name: string): T | undefined {
		return this.state.flags[name] as T | undefined;
	}

	/** Sets a flag to the given value for a given name. If `value` is `undefined`, the flag is removed. */
	setFlag(name: string, value: boolean | number | string | undefined): void {
		if (value === undefined) {
			if (this.state.flags[name] === undefined) return;
			delete this.state.flags[name];
		} else {
			this.state.flags[name] = value;
		}
		this.writeJson(PLAYER_DYNAMIC_PROPERTIES.flags, this.state.flags);
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
		if (mutated) this.writeJson(PLAYER_DYNAMIC_PROPERTIES.flags, this.state.flags);
	}

	/** Returns true if the player has been welcomed. The player is considered welcomed if the welcome GUI has been shown and dismissed. */
	isWelcomed(): boolean {
		return this.state.welcomed;
	}
	/** Sets whether the player has been welcomed. */
	setWelcomed(value: boolean): void {
		this.state.welcomed = value;
		this.writeBoolean(PLAYER_DYNAMIC_PROPERTIES.welcomed, value);
	}

	/**
	 * Retrieves the record version for this player.
	 * The record version is used to track the version of the player's data.
	 * This is used to determine if the player's data needs to be migrated to a new version.
	 */
	getRecordVersion(): string | undefined {
		return this.state.recordVersion;
	}
	/** Sets the record version for this player. */
	setRecordVersion(version: string | undefined): void {
		this.state.recordVersion = version;
		this.writeString(PLAYER_DYNAMIC_PROPERTIES.recordVersion, version);
	}

	/** Wipes all OriginsPE-managed dynamic properties and state tags for this player. */
	reset(): void {
		this.state.origin = undefined;
		this.state.class = undefined;
		this.state.powers = [];
		this.state.perks = [];
		this.state.cooldowns = {};
		this.state.flags = {};
		this.state.welcomed = false;
		this.state.recordVersion = undefined;
		for (const key of Object.values(PLAYER_DYNAMIC_PROPERTIES)) {
			this.player.setDynamicProperty(key, undefined);
		}
		this.syncAllTags();
	}


	//#region SYNC

	/**
	 * Syncs and emits all five tag groups to the current cached state.
	 * 
	 * The purpose of this is so that other systems can query the player state, outside of Scripts API context.
	 * The tags are in the format:
	 * ```
	 * r4isen1920_originspe:origin_<originId>
	 * r4isen1920_originspe:class_<classId>
	 * r4isen1920_originspe:power_<powerId>
	 * r4isen1920_originspe:perk_<perkId>
	 * r4isen1920_originspe:control_<controlId>
	 * ```
	 * For `power_`, `perk_`, and `control_`, multiple tags may be emitted, one for each id in the respective array.
	 */
	private syncAllTags(): void {
		this.syncTag(PLAYER_STATE_TAG_PREFIXES.origin, this.state.origin);
		this.syncTag(PLAYER_STATE_TAG_PREFIXES.class, this.state.class);
		this.syncTagSet(PLAYER_STATE_TAG_PREFIXES.power, this.state.powers);
		this.syncTagSet(PLAYER_STATE_TAG_PREFIXES.perk, this.state.perks);
	}

	/** Removes any tag on the player starting with `prefix`, then adds `prefix + id` if `id` is defined. */
	private syncTag(prefix: string, id: string | undefined): void {
		for (const tag of this.player.getTags()) {
			if (tag.startsWith(prefix)) this.player.removeTag(tag);
		}
		if (id !== undefined) this.player.addTag(prefix + id);
	}

	/** Adds and removes `prefix + id` tags on the player to match `ids` exactly. */
	private syncTagSet(prefix: string, ids: readonly string[]): void {
		const desired = new Set(ids.map(id => prefix + id));
		for (const tag of this.player.getTags()) {
			if (tag.startsWith(prefix) && !desired.has(tag)) this.player.removeTag(tag);
		}
		for (const tag of desired) {
			if (!this.player.hasTag(tag)) this.player.addTag(tag);
		}
	}


	//#region HELPERS
	/** Writes a primitive string-type to the player's dynamic properties. */
	private writeString(key: string, value: string | undefined): void {
		this.player.setDynamicProperty(key, value);
	}

	/** Writes a primitive boolean-type to the player's dynamic properties. */
	private writeBoolean(key: string, value: boolean): void {
		this.player.setDynamicProperty(key, value);
	}

	/** Writes a JSON-serializable value to the player's dynamic properties. The value is converted into string. */
	private writeJson(key: string, value: unknown): void {
		try {
			this.writeString(key, JSON.stringify(value));
		} catch (e: any) {
			PlayerState.log.error(`Failed to write ${key}: `, e);
		}
	}

	/** Reads a primitive string-type from the player's dynamic properties. Returns `undefined` if the property is not a string. */
	private static readString(player: Player, key: string): string | undefined {
		const raw = player.getDynamicProperty(key);
		return typeof raw === 'string' ? raw : undefined;
	}

	/** Reads a primitive boolean-type from the player's dynamic properties. Also returns `false` if the property is not a boolean. */
	private static readBoolean(player: Player, key: string): boolean {
		return player.getDynamicProperty(key) === true;
	}

	/** Reads a JSON-serialized array of strings from the player's dynamic properties. Returns an empty array if the property is not a valid JSON array of strings. */
	private static readJsonArray(player: Player, key: string): string[] {
		const raw = player.getDynamicProperty(key);
		if (typeof raw !== 'string') return [];
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed)
				? parsed.filter((x): x is string => typeof x === 'string')
				: [];
		} catch {
			return [];
		}
	}

	/** Reads a JSON-serialized object from the player's dynamic properties. Returns an empty object if the property is not a valid JSON object. */
	private static readJsonObject<T extends object>(player: Player, key: string): T {
		const raw = player.getDynamicProperty(key);
		if (typeof raw !== 'string') return {} as T;
		try {
			const parsed = JSON.parse(raw);
			return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
				? (parsed as T)
				: ({} as T);
		} catch {
			return {} as T;
		}
	}
}
