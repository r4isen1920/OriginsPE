import {
	ButtonState,
	InputButton,
	InputMode,
	Player,
	PlayerButtonInputAfterEvent,
	PlayerLeaveAfterEvent,
	system,
} from '@minecraft/server';

import { AfterPlayerButtonInput, AfterPlayerLeave } from '../../core/platform/DecoratedEvents';
import { PlayerState } from '../../core/platform/PlayerState';
import { UiBridge } from '../UiBridge';
import { AbilityDispatch } from '../../core/abilities/AbilityDispatch';
import type { Ability } from '../../core/abilities/Ability';
import { PerkRegistry, PowerRegistry } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Log } from '../../utils/Log';
import { isToggleOn } from '../OptionsState';
import { Screen } from './Screen';


//#region CONSTANTS

export const ABILITY_WHEEL = {
	prefix: '_op:abw;',
	/** Slot count (slot 0 = options, slots 1..4 = active abilities). */
	slots: 5,
	/** Width in chars of each icon field. */
	iconWidth: 2,
	/** Absolute index of the selected-slot digit. */
	selectedOffset: 8,
	/** Absolute index where the first icon field begins. */
	iconsOffset: 9,
	/** Separator between the icon block and the animation state word. */
	separator: ';',
	/** Icon id for the always-present options slot. */
	optionsIcon: 'op',
	/** Icon id for an empty ability slot. */
	emptyIcon: '--',
	/** Selected-slot value meaning "nothing highlighted". */
	noneSelected: 'n',
	/** Animation state words appended after the icon block. */
	state: {
		open: 'a',
		retain: 'b',
		select: 'c',
		close: 'd',
	},
} as const;

/** Dialogue scene tag for the ability wheel (input-only NPC scene). */
const WHEEL_SCENE = 'gui_ability_selector';
/** Sentinel slot value for the always-present options slot (slot 0). */
const OPTIONS_SLOT = '__options__';
/** Max number of active abilities shown in the wheel (slots 1..4). */
const MAX_ABILITIES = ABILITY_WHEEL.slots - 1;
/** Window, in ticks, within which consecutive JUMP presses count as one tap run. */
const TAP_WINDOW_TICKS = 8;
/** Number of rapid JUMP presses required to open the wheel. */
const TAP_COUNT = 2;
/** Ticks the close/confirm exit animation is allowed to play before the HUD title is released. */
const CLOSE_ANIM_TICKS = 10;


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
 * Handles the ability wheel.
 * The ability wheel allows the players to execute any of their active abilities on demand,
 * as well as access to the options menu.
 */
export class AbilityWheelScreen extends Screen {
	private static readonly log = Log.get('AbilityWheel', 'ui');

	/** Tick of each player's most recent press, for tap-run detection. */
	private static readonly lastPressed = new Map<string, number>();
	/** Consecutive JUMP presses within the tap window, per player id. */
	private static readonly pressCount = new Map<string, number>();
	/** Active wheel session per player id. */
	private static readonly sessions = new Map<string, WheelSession>();

	readonly verbs = ['wheel'] as const;

	handle(player: Player, [, action, arg]: string[]): void {
		switch (action) {
			case 'slot': {
				const index = Number(arg);
				if (!Number.isInteger(index)) {
					AbilityWheelScreen.log.warn(`wheel slot with non-integer index '${arg}'`);
					return;
				}
				AbilityWheelScreen.handleSlot(player, index);
				return;
			}
			case 'close':
				AbilityWheelScreen.close(player);
				return;
			default:
				AbilityWheelScreen.log.warn(`unknown wheel action '${action}'`);
		}
	}


	//#region INPUT

	@AfterPlayerButtonInput
	static onBtnInput(event: PlayerButtonInputAfterEvent): void {
		const { button, newButtonState, player } = event;

		const playerInput = player.inputInfo.lastInputModeUsed;
		const btnToPress = playerInput === InputMode.Touch ? InputButton.Jump : InputButton.Sneak;
		if (button !== btnToPress || newButtonState !== ButtonState.Pressed) return;

		const now = system.currentTick;
		const last = this.lastPressed.get(player.id);
		const withinWindow = last !== undefined && now > last && now - last <= TAP_WINDOW_TICKS;
		const count = withinWindow ? (this.pressCount.get(player.id) ?? 1) + 1 : 1;

		if (count >= TAP_COUNT) {
			this.lastPressed.delete(player.id);
			this.pressCount.delete(player.id);
			this.open(player);
			return;
		}

		this.lastPressed.set(player.id, now);
		this.pressCount.set(player.id, count);
	}

	@AfterPlayerLeave
	static onLeave(event: PlayerLeaveAfterEvent): void {
		this.lastPressed.delete(event.playerId);
		this.pressCount.delete(event.playerId);
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

		ResourceBarService.suspend(player);
		this.pushPayload(player, session, ABILITY_WHEEL.state.open);
		UiBridge.openDialogue(player, WHEEL_SCENE);
		player.playSound('random.wood_click', { volume: 0.5, pitch: 1 });
	}

	/** Cancels the wheel, plays the exit animation, and restores the HUD bars. */
	static close(player: Player): void {
		const session = this.sessions.get(player.id);
		this.sessions.delete(player.id);
		if (session) this.pushPayload(player, session, ABILITY_WHEEL.state.close);
		this.releaseAfterExit(player);
	}


	//#region SLOT HANDLING

	/**
	 * Handles a slot press routed from the wheel dialogue. First press of a slot
	 * highlights it; pressing the already-highlighted slot confirms it.
	 */
	static handleSlot(player: Player, index: number): void {
		const session = this.sessions.get(player.id);
		if (!session) return;

		const value = session.slots[index];
		if (session.selected === index) {
			this.confirm(player, value);
			return;
		}

		session.selected = index;
		this.pushPayload(player, session, ABILITY_WHEEL.state.select);
		UiBridge.openDialogue(player, WHEEL_SCENE);
		player.playSound('random.click', { volume: 0.4, pitch: 1.2 });
	}

	/** Confirms the highlighted slot, triggering its ability or opening options. */
	private static confirm(player: Player, value: string | null): void {
		if (value === null) {
			this.close(player);
			return;
		}

		const session = this.sessions.get(player.id);
		this.sessions.delete(player.id);
		if (session) this.pushPayload(player, session, ABILITY_WHEEL.state.select);

		if (value === OPTIONS_SLOT) {
			const tag = isToggleOn('particle')
				? 'gui_options_general_root_particleon'
				: 'gui_options_general_root_particleoff';
			UiBridge.openDialogue(player, tag);
			player.onScreenDisplay.setTitle('_op:');
			player.playSound('random.orb', { volume: 1, pitch: 0.2 });
			return;
		}

		this.releaseAfterExit(player);

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

	/**
	 * Lets the close/confirm exit animation play, then releases the HUD title
	 * channel back to the resource bar.
	 */
	private static releaseAfterExit(player: Player): void {
		system.runTimeout(() => {
			if (!player.isValid) return;
			UiBridge.closeScreen(player);
		}, CLOSE_ANIM_TICKS);
	}

	/** Pushes the wheel's selection + icons + animation state to the title text. */
	private static pushPayload(player: Player, session: WheelSession, state: string): void {
		const selected = session.selected >= 0 ? String(session.selected) : ABILITY_WHEEL.noneSelected;

		let icons = '';
		for (let i = 0; i < ABILITY_WHEEL.slots; i++) {
			icons += this.iconFor(session.slots[i]) + ABILITY_WHEEL.separator;
		}

		const payload =
			ABILITY_WHEEL.prefix +
			selected +
			ABILITY_WHEEL.separator +
			icons +
			state +
			ABILITY_WHEEL.separator +
			this.nameFor(session.slots[session.selected]);

		try {
			player.onScreenDisplay.setTitle(payload, {
				fadeInDuration: 0,
				stayDuration: 0,
				fadeOutDuration: 0,
			});
			UI_DEBUG: {
				this.log.debug(`payload: ${payload}`);
			}
		} catch (e: any) {
			this.log.error(`pushPayload for ${player.name}: `, e);
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

	/** Returns the name for a slot value. */
	private static nameFor(value: string | null): string {
		if (value === OPTIONS_SLOT) return 'origins.wheel.options';
		if (value === null) return 'origins.wheel.empty';

		const ability = PowerRegistry.get(value) ?? PerkRegistry.get(value);
		if (!ability) return 'origins.wheel.empty';
		return ability?.displayName ?? `origins.trait.${value}.name`;
	}
}
