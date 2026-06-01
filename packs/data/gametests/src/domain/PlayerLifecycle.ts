import { GameMode, Player, PlayerLeaveAfterEvent, PlayerSpawnAfterEvent, system } from '@minecraft/server';

import {
	AfterPlayerLeave,
	AfterPlayerSpawn,
} from '../core/DecoratedEvents';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/PlayerState';
import { PlayerTick, Ticker } from '../core/Ticker';
import { PickerKind, PickerMode, UiBridge } from '../core/UiBridge';
import { AttributeService, DEFAULT_ATTRIBUTES } from '../services/AttributeService';
import { ResourceBarService } from '../services/ResourceBarService';
import Version from '../utils/Version';
import {
	ClassRegistry,
	OriginRegistry,
	PerkRegistry,
	PowerRegistry,
} from './Registries';


//#region BUILT-IN GRANTS

/** Powers granted to every player regardless of origin. */
const DEFAULT_POWERS: readonly string[] = ['master_of_webs'];
/** Perks granted to every player regardless of class. */
const DEFAULT_PERKS: readonly string[] = [
	'better_stew',
	'longer_potions',
	'more_saturated_food',
	'powerful_potions',
	'quality_equipment',
];


//#region LIFECYCLE

/**
 * Wires player join/leave/spawn into the new state model.
 *
 * - Hydrates {@link PlayerState} on spawn.
 * - Opens the origin/class picker on first join.
 * - Computes power/perk diffs and dispatches {@link Ability.onAcquire}/{@link Ability.onRelease}.
 * - Drives the per-player power/perk tick loop via {@link Ticker}.
 */
export class PlayerLifecycle {
	private static readonly log = Log.get('PlayerLifecycle');

	@AfterPlayerSpawn()
	static onSpawn(ev: PlayerSpawnAfterEvent): void {
		if (!ev.initialSpawn) return;
		const { player } = ev;
		Version.resetPlayerRecordIfUpgradePending(player);
		const state = PlayerState.for(player);

		ResourceBarService.markGuiReady(player, false);

		// Reset transient state.
		state.clearFlagPrefix('cooldown_');
		state.setFlag('controls_opened', false);
		state.setFlag('on_item_hold', true);

		// Delay UI prompts so the client finishes its join transition before
		// dialogue open is attempted. The command silently does nothing if sent
		// while the client is still loading.
		system.runTimeout(() => {
			if (!player.isValid) return;

			// Prompt origin/class pickers if missing.
			if (!state.getOrigin()) {
				UiBridge.openPicker(player, PickerKind.Race, PickerMode.Pick);
				return;
			}
			if (!state.getClass()) {
				UiBridge.openPicker(player, PickerKind.Class, PickerMode.Pick);
				return;
			}

			if (!state.isWelcomed()) {
				UiBridge.openDialogue(player, 'gui_welcome_screen');
			} else {
				ResourceBarService.markGuiReady(player, true);
			}

			this.applyOriginAndClass(player);
		}, 80);
	}

	@AfterPlayerLeave()
	static onLeave(ev: PlayerLeaveAfterEvent): void {
		PlayerState.release(ev.playerId);
		ResourceBarService.forget(ev.playerId);
		AttributeService.forget(ev.playerId);
	}


	//#region GRANT FLOW

	/**
	 * Recomputes the active power/perk lists from the player's origin/class
	 * and runs onRelease/onAcquire diffs. Safe to call any time origin/class changes.
	 */
	static applyOriginAndClass(player: Player): void {
		const state = PlayerState.for(player);
		const originId = state.getOrigin() ?? 'human';
		const classId = state.getClass() ?? 'nitwit';

		const origin = OriginRegistry.get(originId);
		const klass = ClassRegistry.get(classId);
		if (!origin) this.log.error(`Unknown origin '${originId}' on ${player.name}`);
		if (!klass) this.log.error(`Unknown class '${classId}' on ${player.name}`);

		const nextPowers = Array.from(new Set([
			...DEFAULT_POWERS,
			...(origin?.powers ?? []),
		]));
		const nextPerks = Array.from(new Set([
			...DEFAULT_PERKS,
			...(klass?.perks ?? []),
		]));
		const nextControls = Array.from(new Set([
			...(origin?.controls ?? []),
			...(klass?.controls ?? []),
		]));

		// Diff and dispatch.
		const prevPowers = state.getPowers();
		this.diff(prevPowers, nextPowers,
			(id) => PowerRegistry.get(id)?.onRelease?.(player),
			(id) => PowerRegistry.get(id)?.onAcquire?.(player),
		);
		const prevPerks = state.getPerks();
		this.diff(prevPerks, nextPerks,
			(id) => PerkRegistry.get(id)?.onRelease?.(player),
			(id) => PerkRegistry.get(id)?.onAcquire?.(player),
		);

		state.setPowers(nextPowers);
		state.setPerks(nextPerks);
		state.setControls(nextControls);

		// Apply attributes: defaults overlaid by every active power/perk.
		const merged: Partial<Record<keyof typeof DEFAULT_ATTRIBUTES, string>> = { ...DEFAULT_ATTRIBUTES };
		for (const id of nextPowers) {
			const attrs = PowerRegistry.get(id)?.attributes;
			if (attrs) Object.assign(merged, attrs);
		}
		for (const id of nextPerks) {
			const attrs = PerkRegistry.get(id)?.attributes;
			if (attrs) Object.assign(merged, attrs);
		}
		AttributeService.apply(player, merged);

		// Apply origin render effects via data-driven events.
		this.applyEffects(player, origin?.effects?.model, 'model_type');
		this.applyEffects(player, origin?.effects?.skin, 'skin_type');
		this.applyEffects(player, origin?.effects?.emitter, 'emitter_type');

		Version.markPlayerRecordCurrent(player);
	}

	private static diff(
		prev: readonly string[],
		next: readonly string[],
		onRemoved: (id: string) => void,
		onAdded: (id: string) => void,
	): void {
		const prevSet = new Set(prev);
		const nextSet = new Set(next);
		for (const id of prevSet) if (!nextSet.has(id)) onRemoved(id);
		for (const id of nextSet) if (!prevSet.has(id)) onAdded(id);
	}

	private static applyEffects(player: Player, value: string | undefined, suffix: string): void {
		if (!value) return;
		try { player.triggerEvent(`r4isen1920_originspe:${suffix}.${value}`); }
		catch (e: any) { this.log.error(`triggerEvent ${suffix}.${value}: ${e?.stack ?? e}`); }
	}


	//#region TICK LOOP

	/**
	 * Single per-player loop that drives every active power/perk's `onTick`.
	 * Eliminates the per-power `system.runInterval` pattern from the legacy code.
	 */
	@PlayerTick(2)
	static onPlayerTick(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;
		for (const id of state.getPowers()) {
			const p = PowerRegistry.get(id);
			if (p?.onTick) p.onTick(player);
		}
		for (const id of state.getPerks()) {
			const p = PerkRegistry.get(id);
			if (p?.onTick) p.onTick(player);
		}
		// Stamp out expired cooldowns from the DP map.
		const cooldowns = state.getPowers(); // touch state to keep cache hot
		void cooldowns;
		void now;
	}

	/** Force-installs the tick loop. Called from Main as a no-op safety. */
	static ensureTickRegistered(): void {
		// Decorator above already registers; this is a marker for `import` retention.
		void Ticker;
	}

	/** Suppress dev-only spectator phantomize handling for now. */
	static handleGameMode(player: Player): void {
		const state = PlayerState.for(player);
		if (state.hasPower('phantomize') && player.getGameMode() === GameMode.Spectator) {
			state.setFlag('phantomized', true);
		}
	}
}
