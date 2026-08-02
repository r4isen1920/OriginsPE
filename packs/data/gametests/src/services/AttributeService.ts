import { Player } from '@minecraft/server';

import { Log } from '../utils/Log';
import {
	type AttributeKey,
	type AttributeOverrides,
	type AttributeModifier,
	type PlayerAttributes,
	type PropertyAttributeOverrides,
	type NumericAttributeKey,
	DamageOverride,
	DEFAULT_ATTRIBUTES,
	NUMERIC_ATTRIBUTE_KEYS,
	PROPERTY_ATTRIBUTES,
	STEPPED_ATTRIBUTES,
} from './Attributes';
import DamageService from './DamageService';


//#region INSTANCE

/**
 * Per-ability handle for setting dynamic (runtime) attribute contributions on that ability's source.
 * Passed to ability hooks as the last argument. Dynamic values fold on top of the ability's
 * unconditional `attributes` member (unconditional first, then dynamic).
 */
export interface AttributeSourceInstance {
	/** Merges dynamic overrides into this source per-key, then recomputes. */
	set(overrides: AttributeOverrides): void;
	/** Drops specific dynamic keys previously set on this source. */
	remove(...keys: (keyof AttributeOverrides)[]): void;
	/** Drops all dynamic overrides on this source, reverting to its unconditional attributes. */
	clear(): void;
}


//#region SERVICE

/**
 * Handles attribute application and provides a single abstraction layer over player attributes.
 * 
 * Player attributes are normally handled through the player's behavior definition,
 * but this service allows for dynamic modification of attributes at runtime.
 * 
 * The service allows for multiple sources to contribute to a player's attributes,
 * and it will resolve the final values based on the contributions from all sources.
 */
export class AttributeService {
	private static readonly log = Log.get('AttributeService');

	/** Last values written through {@link trigger}, per player. Drives the diff. */
	private static readonly applied = new Map<string, Partial<PlayerAttributes>>();
	/** Declarative stacking contributions, per player: sourceId -> overrides. Ordered by insertion. */
	private static readonly sources = new Map<string, Map<string, AttributeOverrides>>();
	/** Imperative absolute overrides (from {@link apply}) that win over sources, per player. */
	private static readonly overrides = new Map<string, Partial<PlayerAttributes>>();
	/** Runtime per-ability contributions set through {@link source} handles, per player: sourceId -> overrides. */
	private static readonly dynamic = new Map<string, Map<string, AttributeOverrides>>();
	/** Keys currently contributed by a source/override, per player. Removed keys revert to base. */
	private static readonly managed = new Map<string, Set<AttributeKey>>();

	/** Every key that maps to an entity event or actor property (excludes camera/damageOverrides). */
	private static readonly TRIGGER_KEYS: readonly AttributeKey[] =
		(Object.keys(DEFAULT_ATTRIBUTES) as AttributeKey[]).filter((k) => k !== 'damageOverrides');
	/** Non-numeric trigger keys, resolved by last-writer-wins. */
	private static readonly CATEGORICAL_KEYS: readonly AttributeKey[] =
		AttributeService.TRIGGER_KEYS.filter((k) => !(NUMERIC_ATTRIBUTE_KEYS as readonly string[]).includes(k));


	//#region SOURCES

	/**
	 * Registers or replaces a stacking contribution.
	 * This source dictates how the player's attributes are modified.
	 * 
	 * @param player The player to apply the source to.
	 * @param sourceId Unique identifier for this source (e.g. power/perk id).
	 * @param overrides
	 * The attribute contributions from this source.
	 * 
	 * Numeric keys are additive deltas from the base value and combine across every active source.
	 * This means that if multiple sources contribute to the same numeric key, their contributions are summed together
	 * to create the final value. For example, if one source adds +2 to health and another adds +3, the final health
	 * will be increased by +5.
	 * 
	 * If you explicitly want to override the final value of a numeric key, you can use the `set` property
	 * in an {@link AttributeModifier}.
	 * @param defer If `true`, sets to not recompute immediately, and instead do later--must invoke {@link recompute}.
	 */
	static setSource(player: Player, sourceId: string, overrides: AttributeOverrides, defer: boolean = false): void {
		let map = this.sources.get(player.id);
		if (!map) {
			map = new Map();
			this.sources.set(player.id, map);
		}
		map.set(sourceId, overrides);
		if (!defer) this.recompute(player);
	}

	/**
	 * Removes a previously registered source and will no longer count towards the player's attributes.
	 * Its contribution reverts on the next recompute.
	 * 
	 * @param player The player to remove the source from.
	 * @param sourceId Unique identifier for this source (e.g. power/perk id).
	 * @param defer If `true`, sets to not recompute immediately, and instead do later--must invoke {@link recompute}.
	 */
	static removeSource(player: Player, sourceId: string, defer: boolean = false): void {
		const removedBase = this.sources.get(player.id)?.delete(sourceId) ?? false;
		const removedDynamic = this.dynamic.get(player.id)?.delete(sourceId) ?? false;
		if ((removedBase || removedDynamic) && !defer) this.recompute(player);
	}


	//#region DYNAMIC

	/**
	 * Returns a handle for setting an ability's dynamic attribute contributions at runtime.
	 * The handle targets a single source and folds on top of that source's unconditional attributes.
	 *
	 * @param player The player whose source is being manipulated.
	 * @param sourceId Unique identifier for the source (typically the ability's source id).
	 */
	static source(player: Player, sourceId: string): AttributeSourceInstance {
		return new AttributeSourceHandle(player, sourceId);
	}

	/** Merges dynamic overrides into a source per-key. Prefer {@link source}. */
	static mergeDynamic(player: Player, sourceId: string, overrides: AttributeOverrides, defer: boolean = false): void {
		let map = this.dynamic.get(player.id);
		if (!map) {
			map = new Map();
			this.dynamic.set(player.id, map);
		}
		const existing = map.get(sourceId);
		map.set(sourceId, existing ? { ...existing, ...overrides } : { ...overrides });
		if (!defer) this.recompute(player);
	}

	/** Drops specific dynamic keys from a source. Prefer {@link source}. */
	static removeDynamicKeys(player: Player, sourceId: string, keys: readonly (keyof AttributeOverrides)[], defer: boolean = false): void {
		const entry = this.dynamic.get(player.id)?.get(sourceId) as Record<string, unknown> | undefined;
		if (!entry) return;
		let changed = false;
		for (const key of keys) if (key in entry) { delete entry[key as string]; changed = true; }
		if (changed && !defer) this.recompute(player);
	}

	/** Drops all dynamic overrides from a source. Prefer {@link source}. */
	static clearDynamic(player: Player, sourceId: string, defer: boolean = false): void {
		const map = this.dynamic.get(player.id);
		if (map && map.delete(sourceId) && !defer) this.recompute(player);
	}

	/**
	 * Clears the imperative override layer.
	 * This flushes all overrides set and reverts to the base plus sources.
	 * 
	 * @param player The player to clear the overrides for.
	 * @param defer If `true`, sets to not recompute immediately, and instead do later--must invoke {@link recompute}.
	 */
	static clearOverrides(player: Player, defer: boolean = false): void {
		this.overrides.delete(player.id);
		if (!defer) this.recompute(player, { full: true });
	}


	//#region APPLY

	/**
	 * Sets absolute attribute values.
	 * Values set here will override any contributions from other sources and will be applied immediately.
	 *
	 * @param player The player to apply the overrides to.
	 * @param attrs The attribute values to apply.
	 * @param force If `true`, reassert the entire profile.
	 */
	static apply(player: Player, attrs: AttributeOverrides, force: boolean = false): void {
		let ov = this.overrides.get(player.id);
		if (!ov) {
			ov = {};
			this.overrides.set(player.id, ov);
		}
		const mutable = ov as Record<string, unknown>;
		for (const key of Object.keys(attrs) as (keyof AttributeOverrides)[]) {
			mutable[key] = attrs[key];
		}
		this.recompute(player, { full: force });
	}

	/** Resets the player to {@link DEFAULT_ATTRIBUTES} by dropping all sources and overrides. */
	static reset(player: Player): void {
		this.sources.delete(player.id);
		this.dynamic.delete(player.id);
		this.overrides.delete(player.id);
		this.recompute(player, { full: true });
	}

	/** Drops all cached state for a player (call on leave). */
	static forget(playerId: string): void {
		this.applied.delete(playerId);
		this.sources.delete(playerId);
		this.dynamic.delete(playerId);
		this.overrides.delete(playerId);
		this.managed.delete(playerId);
	}

	/** Returns the full applied attribute for the specified `playerId`. */
	static getApplied(playerId: string): Readonly<Partial<PlayerAttributes>> {
		return this.applied.get(playerId) ?? {};
	}


	//#region RECOMPUTE

	/**
	 * Folds base -> sources -> overrides into the resolved profile and fires the diff.
	 * 
	 * @param opts Optional flags for recomputation behavior.
	 * @param opts.full Reassert every key (reverting stale contributions) rather than only managed keys.
	 */
	static recompute(player: Player, opts?: { full?: boolean }): void {
		const full = opts?.full ?? false;
		const id = player.id;
		const sourceList = this.effectiveSources(id);
		const overrides = (this.overrides.get(id) ?? {}) as Partial<Record<AttributeKey, unknown>>;
		const applied = this.applied.get(id) ?? {};
		const mutableApplied = applied as Partial<Record<AttributeKey, PlayerAttributes[AttributeKey]>>;
		const prevManaged = this.managed.get(id) ?? new Set<AttributeKey>();
		const nextManaged = new Set<AttributeKey>();

		const resolved = new Map<AttributeKey, PlayerAttributes[AttributeKey]>();
		for (const key of NUMERIC_ATTRIBUTE_KEYS) {
			let value = this.resolveNumeric(key, sourceList, DEFAULT_ATTRIBUTES[key] as number);
			if (overrides[key] !== undefined) value = overrides[key] as number;
			if (value !== undefined) {
				resolved.set(key, value);
				nextManaged.add(key);
			}
		}
		for (const key of this.CATEGORICAL_KEYS) {
			let value = this.resolveCategorical(key, sourceList);
			if (overrides[key] !== undefined) value = overrides[key] as PlayerAttributes[AttributeKey];
			if (value !== undefined) {
				resolved.set(key, value);
				nextManaged.add(key);
			}
		}

		// Write managed keys plus any that were managed before and have now been dropped (revert).
		const keys = full ? this.TRIGGER_KEYS : Array.from(new Set([...nextManaged, ...prevManaged]));
		for (const key of keys) {
			const value = resolved.has(key) ? resolved.get(key)! : DEFAULT_ATTRIBUTES[key as keyof typeof DEFAULT_ATTRIBUTES] as PlayerAttributes[AttributeKey];
			if (!full && mutableApplied[key] === value) continue;
			this.trigger(player, key, value);
			mutableApplied[key] = value;
		}

		// Damage overrides
		// Concatenate every source, then the imperative layer.
		const damage: DamageOverride[] = [];
		for (const ov of sourceList) if (ov.damageOverrides) damage.push(...ov.damageOverrides);
		if (Array.isArray(overrides.damageOverrides)) damage.push(...(overrides.damageOverrides as DamageOverride[]));
		DamageService.setDamageOverrides(player, damage);

		// Camera is an explicit override consumed by CameraService; never fired as an event.
		let camera: string | undefined;
		let hasCamera = false;
		for (const ov of sourceList) if ('camera' in ov) { camera = ov.camera; hasCamera = true; }
		if ('camera' in overrides) { camera = overrides.camera as string | undefined; hasCamera = true; }
		if (hasCamera) mutableApplied.camera = camera;
		else if (full) mutableApplied.camera = undefined;

		this.applied.set(id, applied);
		this.managed.set(id, nextManaged);
	}

	/** Merges each ability's unconditional base source with its dynamic layer (dynamic wins per-key). */
	private static effectiveSources(id: string): AttributeOverrides[] {
		const base = this.sources.get(id);
		const dyn = this.dynamic.get(id);
		const list: AttributeOverrides[] = [];
		if (base) {
			for (const [sourceId, overrides] of base) {
				const d = dyn?.get(sourceId);
				list.push(d ? { ...overrides, ...d } : overrides);
			}
		}
		if (dyn) {
			for (const [sourceId, overrides] of dyn) {
				if (!base?.has(sourceId)) list.push(overrides);
			}
		}
		return list;
	}

	/** Folds a numeric key across sources: base + sum(add), * product(multiply), unless a `set` wins. */
	private static resolveNumeric(key: NumericAttributeKey, sources: readonly AttributeOverrides[], base: number): number | undefined {
		let present = false;
		let add = 0;
		let multiply = 1;
		let setValue: number | undefined;
		for (const ov of sources) {
			const v = ov[key];
			if (v === undefined) continue;
			present = true;
			if (typeof v === 'number') {
				add += v;
				continue;
			}
			const mod = v as AttributeModifier;
			if (mod.add !== undefined) add += mod.add;
			if (mod.multiply !== undefined) multiply *= mod.multiply;
			if (mod.set !== undefined) setValue = mod.set;
		}
		if (!present) return undefined;
		return setValue !== undefined ? setValue : (base + add) * multiply;
	}

	/** Folds a categorical key across sources by last-writer-wins. */
	private static resolveCategorical(key: AttributeKey, sources: readonly AttributeOverrides[]): PlayerAttributes[AttributeKey] | undefined {
		let value: PlayerAttributes[AttributeKey] | undefined;
		for (const ov of sources) {
			const v = ov[key as keyof AttributeOverrides];
			if (v === undefined) continue;
			value = v as PlayerAttributes[AttributeKey];
		}
		return value;
	}


	//#region INTERNAL

	private static trigger<K extends AttributeKey>(player: Player, key: K, value: PlayerAttributes[K]): void {
		const propId = (PROPERTY_ATTRIBUTES as Record<string, string | undefined>)[key];
		if (propId !== undefined) {
			this.applyActorProperty(player, propId, value as string | number | boolean);
			return;
		}

		const stepped = STEPPED_ATTRIBUTES[key];
		if (stepped) {
			const snapped = this.snap(value as number, stepped.steps);
			this.fireEvent(player, `${stepped.event}.${snapped}`);
			return;
		}

		this.fireEvent(player, `${this.eventNameFor(key)}.${value}`);
	}

	/**
	 * Fires a namespaced entity event, ensures a valid event ran, with error handling wrapping.
	 * @player Who to trigger the event for.
	 * @event The event to trigger. When passed without the namespace prefix, it will be added automatically. Must be a non-empty string.
	 * @returns Whether the event was successfully triggered.
	 */
	public static fireEvent(player: Player, event: string): boolean {
		if (!event || typeof event === 'object' || Array.isArray(event) || String(event).trim() === '') {
			this.log.error(`Invalid event passed: ${event}. Aborting event invocation...`);
			return false;
		}

		let eventName = event;
		if (!event.startsWith('r4isen1920_originspe')) {
			eventName = `r4isen1920_originspe:${event}`;
		}

		try {
        	player.triggerEvent(eventName);
			return true;
    	} catch (e) {
        	this.log.error(`triggerEvent '${eventName}' failed: ${e}`);
    	}
		return false;
	}

	/**
	 * Applies actor-property overrides on `target` as seen from `holder`'s perspective.
	 * Uses the experimental setPropertyOverrideForEntity API.
	 * @param holder The player who is "holding" the target (e.g. the one who can see the override).
	 * @param target The player whose properties are being overridden.
	 * @param attrs The property attributes to override.
	 */
	static applyOverride(holder: Player, target: Player, attrs: PropertyAttributeOverrides): void {
		for (const [key, value] of Object.entries(attrs) as [string, PlayerAttributes[keyof PlayerAttributes]][]) {
			const propId = (PROPERTY_ATTRIBUTES as Record<string, string | undefined>)[key];
			if (!propId || value === undefined) continue;
			try {
				(holder as any).setPropertyOverrideForEntity(target, propId, value);
			} catch (e: any) {
				this.log.error(`setPropertyOverrideForEntity '${propId}' = '${String(value)}' on '${target.id}' failed: ${e}`);
			}
		}
	}

	private static applyActorProperty(player: Player, propId: string, value: string | number | boolean): void {
		try {
			player.setProperty(propId, value);
		} catch (e: any) {
			this.log.error(`Set property '${propId}' = '${String(value)}' failed: ${e}`);
		}
	}

	/** Returns the entry of `steps` closest to `value`; out-of-range values clamp to the nearest bound. */
	private static snap(value: number, steps: readonly number[]): number {
		let best = steps[0];
		let bestDist = Math.abs(value - best);
		for (let i = 1; i < steps.length; i++) {
			const dist = Math.abs(value - steps[i]);
			if (dist < bestDist) {
				best = steps[i];
				bestDist = dist;
			}
		}
		return best;
	}

	private static eventNameFor(key: AttributeKey): string {
		// The data-driven events use snake_case suffixes. Map camelCase keys back.
		switch (key) {
			case 'familyType': return 'family_type';
			case 'isShaking': return 'is_shaking';
			case 'burnsInDaylight': return 'burns_in_daylight';
			case 'displayName': return 'display_name';
			default: return key;
		}
	}
}


//#region HANDLE

/** Concrete {@link AttributeSourceInstance} bound to one player and source id. */
class AttributeSourceHandle implements AttributeSourceInstance {
	constructor(private readonly player: Player, private readonly sourceId: string) {}

	set(overrides: AttributeOverrides): void {
		AttributeService.mergeDynamic(this.player, this.sourceId, overrides);
	}

	remove(...keys: (keyof AttributeOverrides)[]): void {
		AttributeService.removeDynamicKeys(this.player, this.sourceId, keys);
	}

	clear(): void {
		AttributeService.clearDynamic(this.player, this.sourceId);
	}
}
