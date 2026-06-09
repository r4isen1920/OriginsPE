import {
	ButtonState,
	InputButton,
	Player,
	PlayerButtonInputAfterEvent,
	PlayerLeaveAfterEvent,
	system,
} from '@minecraft/server';

import { ABILITY_WHEEL } from '../Constants';
import { AfterPlayerButtonInput, AfterPlayerLeave } from '../core/DecoratedEvents';
import { PlayerState } from '../core/PlayerState';
import { UiBridge } from '../core/UiBridge';
import { AbilityDispatch } from '../domain/AbilityDispatch';
import type { Ability } from '../domain/Ability';
import { PerkRegistry, PowerRegistry } from '../domain/Registries';
import { ResourceBarService } from '../services/ResourceBarService';
import { Log } from '../utils/Log';
import { isToggleOn } from './OptionsState';


//#region CONSTANTS

/** Dialogue scene tag for the ability wheel (see ability_selector.dialogue.json). */
const WHEEL_SCENE = 'gui_ability_selector';
/** Sentinel slot value for the always-present options slot (slot 0). */
const OPTIONS_SLOT = '__options__';
/** Max number of active abilities shown in the wheel (slots 1..4). */
const MAX_ABILITIES = ABILITY_WHEEL.slots - 1;
/** Window, in ticks, within which consecutive JUMP presses count as one tap run. */
const TAP_WINDOW_TICKS = 8;
/** Number of rapid JUMP presses required to open the wheel. */
const TAP_COUNT = 3;


//#region TYPES

/** Transient per-player wheel session, alive only while the wheel is open. */
interface WheelSession {
	/** Slot contents: [0] = {@link OPTIONS_SLOT}, [1..4] = ability id or null. */
	readonly slots: (string | null)[];
	/** Currently highlighted slot index, or -1 when nothing is highlighted. */
	selected: number;
}


//#region ABILITY WHEEL

/**
 * Drives the ability selector wheel. Triple-tapping JUMP opens the wheel, which
 * lists the player's active abilities (plus the always-present options slot).
 * Pressing a slot highlights it; pressing the highlighted slot again confirms
 * it; the close button cancels.
 *
 * Per-player visual state (which slots are filled, which icon, what is
 * highlighted) is pushed through the shared title channel via
 * `player.onScreenDisplay.setTitle(...)` and read in JSON UI as `#title_text`,
 * mirroring the resource-bar technique. Slot presses are routed through the NPC
 * dialogue buttons defined in the wheel scene (see {@link WHEEL_SCENE}).
 */
export default class AbilitySelector {
	private static readonly log = Log.get('AbilityWheel');

	/** Tick of each player's most recent JUMP press, for tap-run detection. */
	private static readonly lastJump = new Map<string, number>();
	/** Consecutive JUMP presses within the tap window, per player id. */
	private static readonly jumpCount = new Map<string, number>();
	/** Active wheel session per player id. */
	private static readonly sessions = new Map<string, WheelSession>();


	//#region INPUT

	@AfterPlayerButtonInput
	static onBtnInput(event: PlayerButtonInputAfterEvent): void {
		const { button, newButtonState, player } = event;
		if (button !== InputButton.Jump || newButtonState !== ButtonState.Pressed) return;

		const now = system.currentTick;
		const last = this.lastJump.get(player.id);
		const withinWindow = last !== undefined && now > last && now - last <= TAP_WINDOW_TICKS;
		const count = withinWindow ? (this.jumpCount.get(player.id) ?? 1) + 1 : 1;

		if (count >= TAP_COUNT) {
			this.lastJump.delete(player.id);
			this.jumpCount.delete(player.id);
			this.open(player);
			return;
		}

		this.lastJump.set(player.id, now);
		this.jumpCount.set(player.id, count);
	}

	@AfterPlayerLeave
	static onLeave(event: PlayerLeaveAfterEvent): void {
		this.lastJump.delete(event.playerId);
		this.jumpCount.delete(event.playerId);
		this.sessions.delete(event.playerId);
	}


	//#region OPEN / CLOSE

	/** Computes the player's ability list and opens the wheel. */
	static open(player: Player): void {
		const ids = this.computeAbilityList(player);
		const slots: (string | null)[] = [OPTIONS_SLOT];
		for (let i = 0; i < MAX_ABILITIES; i++) slots.push(ids[i] ?? null);

		const session: WheelSession = { slots, selected: -1 };
		this.sessions.set(player.id, session);

		this.pushPayload(player, session);
		UiBridge.openDialogue(player, WHEEL_SCENE);
		player.playSound('random.wood_click', { volume: 0.5, pitch: 1 });
	}

	/** Cancels the wheel and restores the HUD resource bars. */
	static close(player: Player): void {
		this.sessions.delete(player.id);
		ResourceBarService.refresh(player);
	}


	//#region SLOT HANDLING

	/**
	 * Handles a slot press routed from the wheel dialogue. First press of a slot
	 * highlights it; pressing the already-highlighted slot confirms it.
	 */
	static handleSlot(player: Player, index: number): void {
		const session = this.sessions.get(player.id);
		if (!session) return;
		if (index < 0 || index >= session.slots.length) return;

		const value = session.slots[index];
		if (value === null) {
			// Empty ability slot -- reopen so the wheel stays visible.
			this.pushPayload(player, session);
			UiBridge.openDialogue(player, WHEEL_SCENE);
			return;
		}

		if (session.selected === index) {
			this.confirm(player, value);
			return;
		}

		session.selected = index;
		this.pushPayload(player, session);
		UiBridge.openDialogue(player, WHEEL_SCENE);
		player.playSound('random.click', { volume: 0.4, pitch: 1.2 });
	}

	/** Confirms the highlighted slot, triggering its ability or opening options. */
	private static confirm(player: Player, value: string): void {
		this.close(player);

		if (value === OPTIONS_SLOT) {
			const tag = isToggleOn('particle')
				? 'gui_options_general_root_particleon'
				: 'gui_options_general_root_particleoff';
			UiBridge.openDialogue(player, tag);
			return;
		}

		const power = PowerRegistry.get(value);
		const ability: Ability | undefined = power ?? PerkRegistry.get(value);
		if (!ability) {
			this.log.warn(`confirm: unknown active ability '${value}'`);
			return;
		}

		player.playSound('random.orb', { volume: 0.6, pitch: 1.4 });
		AbilityDispatch.invoke(
			power ? 'Power' : 'Perk',
			value,
			ability,
			'onActivate',
			(a) => a.onActivate?.(player),
		);
	}


	//#region LIST

	/**
	 * Builds the ordered list of active ability ids for the wheel: granted
	 * powers (in origin order) followed by granted perks, keeping only abilities
	 * that declare {@link Ability.active}. Abilities not on cooldown are listed
	 * first; the result is capped at {@link MAX_ABILITIES}.
	 */
	private static computeAbilityList(player: Player): string[] {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		const ready: string[] = [];
		const cooling: string[] = [];
		const seen = new Set<string>();

		const consider = (id: string, ability: Ability | undefined): void => {
			if (!ability || !ability.active || !ability.onActivate || seen.has(id)) return;
			seen.add(id);
			const key = ability.active.cooldownKey ?? ability.id;
			(state.isOnCooldown(key, now) ? cooling : ready).push(id);
		};

		for (const id of state.getPowers()) consider(id, PowerRegistry.get(id));
		for (const id of state.getPerks()) consider(id, PerkRegistry.get(id));

		return [...ready, ...cooling].slice(0, MAX_ABILITIES);
	}


	//#region PAYLOAD

	/** Pushes the wheel's visual state to the shared title channel. */
	private static pushPayload(player: Player, session: WheelSession): void {
		const selected = session.selected >= 0 ? String(session.selected) : ABILITY_WHEEL.noneSelected;

		let icons = '';
		for (let i = 0; i < ABILITY_WHEEL.slots; i++) {
			icons += this.iconFor(session.slots[i]);
		}

		const payload = `${ABILITY_WHEEL.prefix}${selected}${icons}`;
		try {
			player.onScreenDisplay.setTitle(payload, {
				fadeInDuration: 0,
				stayDuration: 0,
				fadeOutDuration: 0,
			});
		} catch (e: any) {
			this.log.error(`pushPayload for ${player.name}: ${e?.stack ?? e}`);
		}
	}

	/** Resolves the 2-char icon field for a slot value. */
	private static iconFor(value: string | null): string {
		if (value === OPTIONS_SLOT) return ABILITY_WHEEL.optionsIcon;
		if (value === null) return ABILITY_WHEEL.emptyIcon;

		const ability = PowerRegistry.get(value) ?? PerkRegistry.get(value);
		const icon = ability?.active?.icon ?? ABILITY_WHEEL.emptyIcon;
		return icon.slice(0, ABILITY_WHEEL.iconWidth).padEnd(ABILITY_WHEEL.iconWidth, '0');
	}
}


