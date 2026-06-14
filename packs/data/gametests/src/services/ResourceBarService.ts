import { Player, PlayerLeaveAfterEvent, system } from '@minecraft/server';

import { DPK } from '../Constants';
import { AfterPlayerLeave } from '../core/DecoratedEvents';
import { PlayerTick } from '../core/Ticker';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { OnWorldLoad } from '@bedrock-oss/stylish';


//#region TYPES

/** Channels the renderer pulls from. */
export type ResourceBarSlot = 1 | 2 | 3;

/**
 * Represents a the configuration of a resource bar to be rendered on the player's HUD.
 */
export interface ResourceBarPushConfig {
	/** Numerical bar id from `textures/origins/hud/cooldown/`. */
	id: number;
	/** Preferred target slot. If omitted, slot is auto-selected. */
	slot?: ResourceBarSlot;
	/** Start value 0..100. */
	from?: number;
	/** End value 0..100. */
	to?: number;
	/** Duration in seconds. */
	durationSeconds?: number;
	/** If true, the bar stays visible after duration ends. */
	persist?: boolean;
}

interface ResourceBarEntry {
	id: number;
	from: number;
	to: number;
	durationSeconds: number;
	persist: boolean;
	startedAtTick: number;
	expiresAtTick?: number;
}

interface CachedBars {
	slots: Record<ResourceBarSlot, ResourceBarEntry | undefined>;
	lastPayload: string | undefined;
}

interface PersistedBars {
	slots?: Partial<Record<ResourceBarSlot, ResourceBarEntry>>;
}



//#region SERVICE
/**
 * Handles the resource bar
 */
export class ResourceBarService {
	private static readonly log = Logger.getLogger('OriginsPE', 'ResourceBarService');
	private static readonly slots: ResourceBarSlot[] = [1, 2, 3];
	private static readonly payloadPrefix = 'origins.resource_bar';
	private static readonly defaultSegmentBySlot: Record<ResourceBarSlot, string> = {
		1: 'A:00,000,000,000',
		2: 'B:00,000,000,000',
		3: 'C:00,000,000,000',
	};
	private static readonly slotCode: Record<ResourceBarSlot, string> = {
		1: 'A',
		2: 'B',
		3: 'C',
	};
	private static readonly cache = new Map<string, CachedBars>();
	private static readonly expiryTokens = new Map<string, Record<ResourceBarSlot, number>>();
	private static readonly suspended = new Set<string>();

	@OnWorldLoad
	private static onWorldLoad(): void {
		this.log.info('Resource bar service initialized');
	}

	/**
	 * Pushes/updates one bar entry. Supports both temporary cooldown bars and
	 * persistent status bars.
	 */
	static push(player: Player, push: ResourceBarPushConfig): ResourceBarSlot {
		const state = this.ensureState(player);
		const now = system.currentTick;
		const slot = this.selectSlot(state, push);

		const id = this.clampInt(push.id, 0, 99);
		const from = this.clampInt(push.from ?? 100, 0, 100);
		const to = this.clampInt(push.to ?? 0, 0, 100);
		const persist = push.persist === true;
		const durationSeconds = Math.max(1, this.clampInt(push.durationSeconds ?? 1, 0, 999));

		state.slots[slot] = {
			id,
			from,
			to,
			durationSeconds,
			persist,
			startedAtTick: now,
			expiresAtTick: persist ? undefined : now + durationSeconds * 20,
		};

		if (persist) {
			this.bumpExpiryToken(player.id, slot);
		} else {
			this.scheduleExpiry(player, slot, durationSeconds * 20);
		}

		this.persistState(player, state);
		this.emitPayload(player, state);
		this.log.debug(
			`push slot: ${slot}, id: ${id}, from: ${from}, to: ${to}, durationSeconds: ${durationSeconds}, persist: ${persist}`,
		);
		return slot;
	}

	/**
	 * Removes the first matching bar by id. Returns true if a slot was cleared.
	 */
	static pop(player: Player, id: number): boolean {
		const state = this.ensureState(player);
		const slot = this.slots.find((x) => state.slots[x]?.id === id);
		if (!slot) return false;

		this.bumpExpiryToken(player.id, slot);
		state.slots[slot] = undefined;
		this.persistState(player, state);
		this.emitPayload(player, state);
		this.log.debug(`pop id: ${id}, slot: ${slot}`);
		return true;
	}

	/**
	 * Removes a bar directly by slot.
	 */
	static popSlot(player: Player, slot: ResourceBarSlot): void {
		const state = this.ensureState(player);
		if (!state.slots[slot]) return;

		this.bumpExpiryToken(player.id, slot);
		state.slots[slot] = undefined;
		this.persistState(player, state);
		this.emitPayload(player, state);
		this.log.debug(`pop slot: ${slot}`);
	}

	/** Clears all bars for the player. */
	static clear(player: Player): void {
		const state = this.ensureState(player);
		for (const slot of this.slots) this.bumpExpiryToken(player.id, slot);
		state.slots = this.emptySlots();
		this.persistState(player, state);
		this.emitPayload(player, state);
		this.log.debug(`clear all bars for player: ${player.name}`);
	}

	/**
	 * Forces the resource bar title payload to be re-emitted. Used after another
	 * system (e.g. the ability wheel) temporarily overwrites the shared title
	 * channel, so the HUD bars are restored.
	 */
	static refresh(player: Player): void {
		const state = this.ensureState(player);
		state.lastPayload = undefined;
		this.emitPayload(player, state);
	}

	/**
	 * Suspends title emission so another system can own the
	 * shared title channel without being clobbered by bar updates.
	 */
	static suspend(player: Player): void {
		this.suspended.add(player.id);
	}

	/** Resumes title emission and immediately restores the HUD bars. */
	static resume(player: Player): void {
		this.suspended.delete(player.id);
		this.refresh(player);
	}

	@AfterPlayerLeave
	private static onPlayerLeave(ev: PlayerLeaveAfterEvent): void {
		this.cache.delete(ev.playerId);
		this.expiryTokens.delete(ev.playerId);
		this.suspended.delete(ev.playerId);
	}

	@PlayerTick(2)
	private static onTick(player: Player): void {
		const state = this.ensureState(player);
		const now = system.currentTick;
		let dirty = false;

		for (const slot of this.slots) {
			const bar = state.slots[slot];
			if (!bar || bar.persist) continue;

			const expireAt = bar.expiresAtTick ?? (bar.startedAtTick + bar.durationSeconds * 20);
			if (now >= expireAt) {
				this.bumpExpiryToken(player.id, slot);
				state.slots[slot] = undefined;
				dirty = true;
			}
		}

		if (dirty) {
			this.persistState(player, state);
			this.emitPayload(player, state);
			return;
		}

		if (!state.lastPayload && this.hasVisibleBars(state)) {
			this.emitPayload(player, state);
		}
	}

	private static selectSlot(state: CachedBars, push: ResourceBarPushConfig): ResourceBarSlot {
		if (push.slot) return push.slot;

		const existing = this.slots.find((x) => state.slots[x]?.id === push.id);
		if (existing) return existing;

		const empty = this.slots.find((x) => !state.slots[x]);
		if (empty) return empty;

		const oldest = this.slots
			.map((slot) => ({ slot, startedAtTick: state.slots[slot]?.startedAtTick ?? Number.MAX_SAFE_INTEGER }))
			.sort((a, b) => a.startedAtTick - b.startedAtTick)[0];
		return oldest?.slot ?? 1;
	}

	private static hasVisibleBars(state: CachedBars): boolean {
		return this.slots.some((slot) => !!state.slots[slot]);
	}

	private static ensureState(player: Player): CachedBars {
		const cached = this.cache.get(player.id);
		if (cached) return cached;

		const hydrated = this.hydrate(player);
		this.cache.set(player.id, hydrated);
		return hydrated;
	}

	private static hydrate(player: Player): CachedBars {
		const raw = player.getDynamicProperty(DPK.resourceBars);
		if (typeof raw !== 'string') {
			return { slots: this.emptySlots(), lastPayload: undefined };
		}

		try {
			const parsed = JSON.parse(raw) as PersistedBars;
			const now = system.currentTick;
			const slots = this.emptySlots();

			for (const slot of this.slots) {
				const entry = parsed.slots?.[slot];
				if (!entry) continue;

				const id = this.clampInt(entry.id, 0, 99);
				const to = this.clampInt(entry.to, 0, 100);
				const from = this.clampInt(entry.from, 0, 100);
				const persist = entry.persist === true;
				const durationSeconds = Math.max(1, this.clampInt(entry.durationSeconds, 1, 999));
				const startedAtTick = this.clampInt(entry.startedAtTick, 0, Number.MAX_SAFE_INTEGER);
				const expiresAtTick = this.clampInt(
					entry.expiresAtTick ?? (startedAtTick + durationSeconds * 20),
					0,
					Number.MAX_SAFE_INTEGER,
				);

				if (!persist) {
					const totalTicks = Math.max(1, expiresAtTick - startedAtTick);
					const elapsedTicks = Math.max(0, now - startedAtTick);
					if (now >= expiresAtTick) continue;

					const remainingTicks = expiresAtTick - now;
					const progress = elapsedTicks / totalTicks;
					const currentFrom = this.clampInt(
						Math.round(from + (to - from) * progress),
						0,
						100,
					);

					slots[slot] = {
						id,
						from: currentFrom,
						to,
						durationSeconds: Math.max(1, Math.ceil(remainingTicks / 20)),
						persist,
						startedAtTick: now,
						expiresAtTick,
					};
					this.scheduleExpiry(player, slot, remainingTicks);
					continue;
				}

				slots[slot] = {
					id,
					from,
					to,
					durationSeconds,
					persist,
					startedAtTick,
					expiresAtTick: undefined,
				};
				this.bumpExpiryToken(player.id, slot);
			}

			return { slots, lastPayload: undefined };
		} catch (e: any) {
			this.log.warn(`Failed to hydrate resource bars for player: ${player.name}, error: ${e?.stack ?? e}`);
			return { slots: this.emptySlots(), lastPayload: undefined };
		}
	}

	private static persistState(player: Player, state: CachedBars): void {
		const data: PersistedBars = { slots: {} };
		for (const slot of this.slots) {
			const entry = state.slots[slot];
			if (!entry) continue;
			data.slots![slot] = entry;
		}

		try {
			player.setDynamicProperty(DPK.resourceBars, JSON.stringify(data));
		} catch (e: any) {
			this.log.error(`Failed to persist bars for player: ${player.name}, error: ${e?.stack ?? e}`);
		}
	}

	private static emitPayload(player: Player, state: CachedBars): void {
		if (this.suspended.has(player.id)) return;

		const parts = this.slots.map((slot) => {
			const bar = state.slots[slot];
			return bar ? this.segment(slot, bar) : this.defaultSegmentBySlot[slot];
		});
		const payload = `${this.payloadPrefix} ${parts.join(' ')}`;
		if (payload === state.lastPayload) return;

		try {
			player.onScreenDisplay.setTitle(payload, {
				fadeInDuration: 0,
				stayDuration: 0,
				fadeOutDuration: 0,
			});
			state.lastPayload = payload;
		} catch (e: any) {
			this.log.error(`Failed to send payload for player: ${player.name}, error: ${e?.stack ?? e}`);
		}
	}

	private static segment(slot: ResourceBarSlot, bar: ResourceBarEntry): string {
		const id = String(this.clampInt(bar.id, 0, 99)).padStart(2, '0');
		const from = String(this.clampInt(bar.from, 0, 100)).padStart(3, '0');
		const to = String(this.clampInt(bar.to, 0, 100)).padStart(3, '0');
		const duration = String(this.clampInt(bar.durationSeconds, 0, 999)).padStart(3, '0');
		return `${this.slotCode[slot]}:${id},${from},${to},${duration}`;
	}

	private static emptySlots(): Record<ResourceBarSlot, ResourceBarEntry | undefined> {
		return { 1: undefined, 2: undefined, 3: undefined };
	}

	private static clampInt(value: number, min: number, max: number): number {
		if (!Number.isFinite(value)) return min;
		const rounded = Math.round(value);
		if (rounded < min) return min;
		if (rounded > max) return max;
		return rounded;
	}

	private static bumpExpiryToken(playerId: string, slot: ResourceBarSlot): number {
		const entry = this.expiryTokens.get(playerId) ?? { 1: 0, 2: 0, 3: 0 };
		entry[slot] += 1;
		this.expiryTokens.set(playerId, entry);
		return entry[slot];
	}

	private static scheduleExpiry(player: Player, slot: ResourceBarSlot, delayTicks: number): void {
		const delay = Math.max(1, this.clampInt(delayTicks, 1, Number.MAX_SAFE_INTEGER));
		const token = this.bumpExpiryToken(player.id, slot);

		system.runTimeout(() => {
			if (!player.isValid) return;
			const tokens = this.expiryTokens.get(player.id);
			if (!tokens || tokens[slot] !== token) return;

			const state = this.ensureState(player);
			const bar = state.slots[slot];
			if (!bar || bar.persist) return;

			const now = system.currentTick;
			const expireAt = bar.expiresAtTick ?? (bar.startedAtTick + bar.durationSeconds * 20);
			if (now < expireAt) {
				this.scheduleExpiry(player, slot, expireAt - now);
				return;
			}

			state.slots[slot] = undefined;
			this.persistState(player, state);
			this.emitPayload(player, state);
		}, delay);
	}

}
