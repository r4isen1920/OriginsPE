import {
	GameMode,
	Player,
	PlayerLeaveAfterEvent,
	PlayerSpawnAfterEvent,
	system,
	TicksPerSecond,
	WorldLoadAfterEvent
} from '@minecraft/server';

import { AfterPlayerLeave, AfterPlayerSpawn, AfterWorldLoad } from '../platform/DecoratedEvents';
import { Log } from '../../utils/Log';
import { PlayerState } from '../platform/PlayerState';
import { PlayerTick, Ticker } from '../platform/Ticker';
import { UiBridge } from '../../ui/UiBridge';
import { PickerKind, PickerMode } from '../../ui/UiPayload';
import { AttributeService } from '../../services/AttributeService';
import { AttributeOverrides } from '../../services/Attributes';
import { CameraService } from '../../services/CameraService';
import Version from '../../utils/Version';
import { type OriginEffects, Perk, Power } from './Ability';
import { AbilityDispatch } from './AbilityDispatch';
import { ClassRegistry, OriginRegistry, PerkRegistry, PowerRegistry } from './Registries';
import DamageService from '../../services/DamageService';



//#region BUILT-IN GRANTS

/** Powers granted to every player regardless of origin. */
const DEFAULT_POWERS: readonly string[] = [];
/** Perks granted to every player regardless of class. */
const DEFAULT_PERKS: readonly string[] = [];



//#region LIFECYCLE

/**
 * Handles how players join, leave, and tick in the world.
 */
export class PlayerLifecycle {
	private static readonly log = Log.get('PlayerLifecycle');
	private static readonly skippedReInitPlayers = new Set<string>();

	private static readonly JOIN_UI_ACK_FLAG = 'join_ui_loaded';

	@AfterPlayerSpawn()
	static onSpawn(ev: PlayerSpawnAfterEvent): void {
		if (!ev.initialSpawn) return;
		const { player } = ev;
		Version.resetPlayerRecordIfUpgradePending(player);
		const state = PlayerState.for(player);

		// Reset transient state.
		state.clearFlagPrefix('cooldown_');
		state.setFlag('controls_opened', false);
		state.setFlag('on_item_hold', true);
		state.setFlag(this.JOIN_UI_ACK_FLAG, false);

		// Delay the first open attempt, then keep retrying until the dialogue
		// acknowledges that it actually loaded on the client side.
		system.runTimeout(() => this.openJoinDialogue(player), 80);
	}

	@AfterPlayerLeave()
	static onLeave(ev: PlayerLeaveAfterEvent): void {
		PlayerState.release(ev.playerId);
		AttributeService.forget(ev.playerId);
		CameraService.forget(ev.playerId);
		DamageService.forgetDamageOverrides(ev.playerId);
	}

	static onJoinDialogueLoaded(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<boolean>(this.JOIN_UI_ACK_FLAG) === true) return;
		state.setFlag(this.JOIN_UI_ACK_FLAG, true);
		this.log.info(`join dialogue loaded: player: ${player.name}`);

		if (!state.getOrigin() || !state.getClass()) return;
		if (!state.isWelcomed()) return;
		this.applyOriginAndClass(player);
	}

	private static openJoinDialogue(player: Player): void {
		if (!player.isValid) return;
		const state = PlayerState.for(player);
		if (state.getFlag<boolean>(this.JOIN_UI_ACK_FLAG) === true) return;

		// Prompt origin/class pickers if missing.
		if (!state.getOrigin()) {
			UiBridge.openPicker(player, PickerKind.Race, PickerMode.Pick);
			system.runTimeout(() => this.openJoinDialogue(player), 20);
			return;
		}
		if (!state.getClass()) {
			UiBridge.openPicker(player, PickerKind.Class, PickerMode.Pick);
			system.runTimeout(() => this.openJoinDialogue(player), 20);
			return;
		}

		if (!state.isWelcomed()) {
			UiBridge.openDialogue(player, 'gui_welcome_screen');
			system.runTimeout(() => this.openJoinDialogue(player), 20);
			return;
		}
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

		const nextPowers = this.filterRegistered(
			'Power',
			Array.from(new Set([...DEFAULT_POWERS, ...(origin?.powers ?? [])])),
			(id) => PowerRegistry.has(id),
			player
		);
		const nextPerks = this.filterRegistered(
			'Perk',
			Array.from(new Set([...DEFAULT_PERKS, ...(klass?.perks ?? [])])),
			(id) => PerkRegistry.has(id),
			player
		);

		// Diff and dispatch.
		const prevPowers = state.getPowers();
		this.diff(
			prevPowers,
			nextPowers,
			(id) =>
				AbilityDispatch.invoke(
					player,
					'Power',
					id,
					PowerRegistry.get(id),
					'onRelease',
					(power, attrs) => power.onRelease?.(player, attrs)
				),
			(id) =>
				AbilityDispatch.invoke(
					player,
					'Power',
					id,
					PowerRegistry.get(id),
					'onAcquire',
					(power, attrs) => power.onAcquire?.(player, attrs)
				)
		);
		const prevPerks = state.getPerks();
		this.diff(
			prevPerks,
			nextPerks,
			(id) =>
				AbilityDispatch.invoke(
					player,
					'Perk',
					id,
					PerkRegistry.get(id),
					'onRelease',
					(perk, attrs) => perk.onRelease?.(player, attrs)
				),
			(id) =>
				AbilityDispatch.invoke(
					player,
					'Perk',
					id,
					PerkRegistry.get(id),
					'onAcquire',
					(perk, attrs) => perk.onAcquire?.(player, attrs)
				)
		);

		state.setPowers(nextPowers);
		state.setPerks(nextPerks);

		for (const id of prevPowers) {
			if (!nextPowers.includes(id))
				AttributeService.removeSource(
					player,
					AbilityDispatch.sourceIdFor('Power', id),
					true
				);
		}
		for (const id of prevPerks) {
			if (!nextPerks.includes(id))
				AttributeService.removeSource(
					player,
					AbilityDispatch.sourceIdFor('Perk', id),
					true
				);
		}

		for (const id of nextPowers) {
			this.registerStaticSource(
				player,
				AbilityDispatch.sourceIdFor('Power', id),
				PowerRegistry.get(id)?.attributes
			);
		}
		for (const id of nextPerks) {
			this.registerStaticSource(
				player,
				AbilityDispatch.sourceIdFor('Perk', id),
				PerkRegistry.get(id)?.attributes
			);
		}

		const originEffects = this.originEffectsToAttributes(origin?.effects);
		if (Object.keys(originEffects).length > 0)
			AttributeService.setSource(player, 'origin:effects', originEffects, true);
		else AttributeService.removeSource(player, 'origin:effects', true);

		//! Drop stale imperative toggles from the previous origin, then reassert the whole profile
		//! so attributes set through direct entity events reset to baseline before layering sources.
		AttributeService.clearOverrides(player, true);
		AttributeService.recompute(player, { full: true });

		Version.markPlayerRecordCurrent(player);
	}

	/** Registers an ability's unconditional attributes as its stacking source. Always registered so the ability owns a source even with no attributes. */
	private static registerStaticSource(
		player: Player,
		sourceId: string,
		attrs: AttributeOverrides | undefined
	): void {
		AttributeService.setSource(player, sourceId, attrs ?? {}, true);
	}

	private static diff(
		prev: readonly string[],
		next: readonly string[],
		onRemoved: (id: string) => void,
		onAdded: (id: string) => void
	): void {
		const prevSet = new Set(prev);
		const nextSet = new Set(next);
		for (const id of prevSet) if (!nextSet.has(id)) onRemoved(id);
		for (const id of nextSet) if (!prevSet.has(id)) onAdded(id);
	}

	/**
	 * Keeps only ids with a registered implementation; warns once per skipped id.
	 * A trait referenced by an origin/class but never registered is ignored rather
	 * than granted, so dispatch never touches a phantom ability.
	 */
	private static filterRegistered(
		kind: string,
		ids: readonly string[],
		has: (id: string) => boolean,
		player: Player
	): string[] {
		const kept: string[] = [];
		for (const id of ids) {
			if (has(id)) {
				kept.push(id);
				continue;
			}
			this.log.warn(
				`${kind} '${id}' has no registered implementation, skipping for player: ${player.name}`
			);
		}
		return kept;
	}

	private static originEffectsToAttributes(
		originEffects: OriginEffects | undefined
	): AttributeOverrides {
		if (!originEffects) return {};
		return {
			emitterType: originEffects.emitter,
			modelType: originEffects.model,
			skinType: originEffects.skin
		};
	}


	
	
	//#region TICK LOOP

	/** Cadence applied to an ability that does not declare its own `tickInterval`. */
	private static readonly DEFAULT_TICK_INTERVAL = 2;

	@PlayerTick(1)
	static onPlayerTick(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;
		for (const id of state.getPowers()) {
			this.tickAbility(player, now, 'Power', id, PowerRegistry.get(id));
		}
		for (const id of state.getPerks()) {
			this.tickAbility(player, now, 'Perk', id, PerkRegistry.get(id));
		}
	}

	private static tickAbility(
		player: Player,
		now: number,
		kind: string,
		id: string,
		ability: Power | Perk | undefined
	): void {
		if (!ability?.onTick) return;
		const interval = ability.tickInterval ?? this.DEFAULT_TICK_INTERVAL;
		if (now % interval !== 0) return;
		AbilityDispatch.invoke(player, kind, id, ability, 'onTick', (a, attrs) =>
			a.onTick(player, attrs)
		);
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


	
	
	//#region RE-INIT
	/**
	 * Mainly used after running the `/reload` command, which resets the world in-place.
	 */
	@AfterWorldLoad
	static reInitializeAllExistingPlayers(): void {
		system.runTimeout(() => {
			const all = Ticker.getPlayers();
			for (const player of all) {
				if (this.skippedReInitPlayers.has(player.id)) continue;

				const state = PlayerState.for(player);
				if (!state.getFlag<boolean>(this.JOIN_UI_ACK_FLAG)) continue;
				if (!state.getOrigin() || !state.getClass()) continue;

				this.log.info(`Re-initializing player: ${player.name}`);
				this.applyOriginAndClass(player);
			}
		}, TicksPerSecond);
	}
}
