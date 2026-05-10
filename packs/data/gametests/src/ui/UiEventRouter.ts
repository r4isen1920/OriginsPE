import { CommandPermissionLevel, Player, ScriptEventCommandMessageAfterEvent, ScriptEventSource, world } from '@minecraft/server';

import { UI_EVENT, WORLD_DPK } from '../Constants';
import { SystemAfterScriptEventReceive } from '../core/DecoratedEvents';
import { PlayerState } from '../core/PlayerState';
import { UiBridge } from '../core/UiBridge';
import { PlayerLifecycle } from '../domain/PlayerLifecycle';
import { Log } from '../utils/Log';
import { adminToggleVector, flipToggle, isToggleOn, resetAllToggles } from './OptionsState';
import type { ToggleKey } from './OptionsState';
import { isValidId, defaultId } from './PickerRegistry';
import { neighborId, toggleBan } from './PickerNavigation';
import { pickerSceneTag } from './UiPayload';
import type { PickerKind, PickerMode } from './UiPayload';


//#region ROUTER

/**
 * Handles every dialogue button callback for the OriginsPE picker UI. Buttons
 * fire `scriptevent r4isen1920_originspe:ui <verb>:<args>` and this class
 * dispatches based on the verb.
 *
 * Verb taxonomy:
 *
 * | Verb                                 | Behaviour                          |
 * |--------------------------------------|------------------------------------|
 * | `nav:<kind>:<dir>:<id>:<mode>`       | Open the prev/next scene.          |
 * | `pick:<kind>:<id>`                   | Commit a selection.                |
 * | `ban:<kind>:<id>`                    | Toggle ban; reopen current scene.  |
 * | `open:<kind>:<mode>[:<id>]`          | Open a picker fresh.               |
 * | `welcome:close`                      | Close welcome; mark player as done.|
 * | `welcome:ignore`                     | Toggle ignore tag on -- show alt.  |
 * | `welcome:unignore`                   | Toggle ignore tag off -- show main.|
 *
 * `<kind>` -- `race` | `class`. `<mode>` -- `pick` | `change` | `view` | `ban`.
 * `<dir>` -- `prev` | `next`.
 */
export class UiEventRouter {
	private static readonly log = Log.get('UiEventRouter');

	@SystemAfterScriptEventReceive()
	static onEvent(ev: ScriptEventCommandMessageAfterEvent): void {
		if (ev.id !== UI_EVENT) return;
		const player = ev.sourceType === ScriptEventSource.Entity && ev.sourceEntity instanceof Player
			? ev.sourceEntity
			: undefined;
		if (!player) {
			this.log.warn(`${UI_EVENT} fired without a player source; ignoring`);
			return;
		}
		try {
			this.dispatch(player, String(ev.message ?? ''));
		} catch (e: any) {
			this.log.error(`dispatch '${ev.message}': ${e?.stack ?? e}`);
		}
	}

	private static dispatch(player: Player, message: string): void {
		const parts = message.split(':');
		const verb = parts[0];
		switch (verb) {
			case 'nav': return this.handleNav(player, parts);
			case 'pick': return this.handlePick(player, parts);
			case 'ban': return this.handleBan(player, parts);
			case 'open': return this.handleOpen(player, parts);
			case 'open_options': return this.handleOpenOptions(player, parts);
			case 'toggle': return this.handleToggle(player, parts);
			case 'reset': return this.handleReset(player, parts);
			case 'evict_unselected': return this.handleEvictUnselected(player);
			case 'close': return; /* dialogue closes itself; no-op */
			case 'welcome': return this.handleWelcome(player, parts);
			default:
				this.log.warn(`unknown verb '${verb}' in '${message}'`);
		}
	}


	//#region HANDLERS

	private static handleNav(player: Player, [, kind, dir, id, mode]: string[]): void {
		if (!this.isKind(kind) || !this.isMode(mode)) return;
		if (dir !== 'prev' && dir !== 'next') return;
		if (!id || !isValidId(kind, id)) return;

		const next = neighborId(kind, mode, id, dir);
		UiBridge.openDialogue(player, pickerSceneTag(kind, mode, next));
	}

	private static handlePick(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id) return;
		if (id !== 'random' && !isValidId(kind, id)) return;

		const state = PlayerState.for(player);
		const resolved = id === 'random' ? this.rollRandom(kind) : id;
		if (kind === 'race') state.setOrigin(resolved);
		else state.setClass(resolved);

		PlayerLifecycle.applyOriginAndClass(player);

		// After commit, fall through to the welcome screen if first-time, else close.
		if (kind === 'race' && !state.getClass()) {
			UiBridge.openPicker(player, 'class', 'pick');
			return;
		}
		if (!state.isWelcomed()) {
			UiBridge.openDialogue(player, 'gui_welcome_screen');
		}
		// Otherwise let the dialogue close itself (no further open).
	}

	private static handleBan(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id || !isValidId(kind, id)) return;
		toggleBan(kind, id);
		// Reopen the same scene so the UI can re-render the new ban state.
		UiBridge.openDialogue(player, pickerSceneTag(kind, 'ban', id));
	}

	private static handleOpen(player: Player, [, kind, mode, id]: string[]): void {
		if (!this.isKind(kind) || !this.isMode(mode)) return;
		const target = id && isValidId(kind, id) ? id : defaultId(kind);
		UiBridge.openDialogue(player, pickerSceneTag(kind, mode, target));
	}


	//#region OPTIONS HANDLERS

	private static isAdmin(player: Player): boolean {
		return player.commandPermissionLevel !== CommandPermissionLevel.Any;
	}

	private static handleOpenOptions(player: Player, [, which]: string[]): void {
		switch (which) {
			case 'general': {
				const tag = isToggleOn('particle')
					? 'gui_options_general_root_particleon'
					: 'gui_options_general_root_particleoff';
				UiBridge.openDialogue(player, tag);
				return;
			}
			case 'admin':
				UiBridge.openDialogue(player, this.isAdmin(player) ? 'gui_options_admin_root' : 'gui_options_admin_denied');
				return;
			case 'admin_reset_confirm':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				UiBridge.openDialogue(player, 'gui_options_admin_root_resetconfirm');
				return;
			case 'admin_ban':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				UiBridge.openDialogue(player, 'gui_options_admin_ban_root');
				return;
			case 'admin_toggle':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				UiBridge.openDialogue(player, `gui_options_admin_toggle_root_${adminToggleVector()}`);
				return;
			default:
				this.log.warn(`unknown options group '${which}'`);
		}
	}

	private static handleToggle(player: Player, [, key]: string[]): void {
		if (!this.isToggleKey(key)) return;
		// Particle is the only player-facing toggle; the others require admin.
		if (key !== 'particle' && !this.isAdmin(player)) {
			UiBridge.openDialogue(player, 'gui_options_admin_denied');
			return;
		}
		flipToggle(key);
		// Reopen the relevant scene so its label/icon reflects the new state.
		if (key === 'particle') {
			this.handleOpenOptions(player, ['open_options', 'general']);
		} else {
			this.handleOpenOptions(player, ['open_options', 'admin_toggle']);
		}
	}

	private static handleReset(player: Player, [, scope]: string[]): void {
		switch (scope) {
			case 'player':
				PlayerState.for(player).reset();
				PlayerLifecycle.applyOriginAndClass(player);
				UiBridge.openPicker(player, 'race', 'pick');
				return;
			case 'all':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				world.setDynamicProperty(WORLD_DPK.toggles, undefined);
				world.setDynamicProperty(WORLD_DPK.bans, undefined);
				resetAllToggles();
				for (const p of world.getAllPlayers()) {
					PlayerState.for(p).reset();
					PlayerLifecycle.applyOriginAndClass(p);
					UiBridge.openPicker(p, 'race', 'pick');
				}
				return;
			default:
				this.log.warn(`unknown reset scope '${scope}'`);
		}
	}

	private static handleEvictUnselected(player: Player): void {
		if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
		for (const p of world.getAllPlayers()) {
			const st = PlayerState.for(p);
			if (!st.getOrigin() || !st.getClass()) {
				UiBridge.openPicker(p, 'race', 'pick');
			}
		}
	}


	//#region WELCOME HANDLER

	private static handleWelcome(player: Player, [, action]: string[]): void {
		switch (action) {
			case 'close':
				PlayerState.for(player).setWelcomed(true);
				return;
			case 'ignore':
				UiBridge.openDialogue(player, 'gui_welcome_screen_ignore');
				return;
			case 'unignore':
				UiBridge.openDialogue(player, 'gui_welcome_screen');
				return;
			default:
				this.log.warn(`unknown welcome action '${action}'`);
		}
	}


	//#region HELPERS

	private static isKind(v: string | undefined): v is PickerKind {
		return v === 'race' || v === 'class';
	}

	private static isMode(v: string | undefined): v is PickerMode {
		return v === 'pick' || v === 'change' || v === 'view' || v === 'ban';
	}

	private static isToggleKey(v: string | undefined): v is ToggleKey {
		return v === 'orb' || v === 'paper' || v === 'unique' || v === 'announce' || v === 'particle';
	}

	private static rollRandom(kind: PickerKind): string {
		const ids = (kind === 'race' ? ORIGIN_POOL : CLASS_POOL);
		return ids[Math.floor(Math.random() * ids.length)] ?? defaultId(kind);
	}
}


//#region RANDOM POOLS

// Hard-coded mirrors of the navigable ids; kept here (instead of importing from
// PickerRegistry) so a future random-eligibility flag can diverge from the nav set.
const ORIGIN_POOL: readonly string[] = [
	'human', 'avian', 'arachnid', 'elytrian', 'shulk', 'feline', 'enderian',
	'merling', 'blazeborn', 'phantom', 'kitsune', 'slimecican', 'inchling',
	'bee', 'piglin', 'starborne', 'elf', 'voidwalker', 'diviner', 'mole', 'rootkin',
];
const CLASS_POOL: readonly string[] = [
	'nitwit', 'archer', 'beastmaster', 'blacksmith', 'cleric', 'cook', 'explorer',
	'farmer', 'lumberjack', 'merchant', 'miner', 'rancher', 'rogue', 'warrior',
];
