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
import { neighborId, toggleBan, isBanned, wouldBanLimitIfBanned } from './PickerNavigation';
import { pickerSceneTag } from './UiPayload';
import type { PickerKind, PickerMode } from './UiPayload';
import AbilitySelector from './AbilitySelector';


//#region ROUTER

/**
 * Handles every dialogue button callback for the OriginsPE picker UI. Buttons
 * fire `scriptevent r4isen1920_originspe:ui <verb>:<args>` and this class
 * dispatches based on the verb.
 *
 * Verb taxonomy:
 *
 * | Verb                                 | Behaviour                                          |
 * |--------------------------------------|----------------------------------------------------|
 * | `nav:<kind>:<dir>:<id>:<mode>`       | Open the prev/next scene (mode-aware).             |
 * | `pick:<kind>:<id>`                   | Commit a selection and open its view scene.        |
 * | `viewed:<kind>:<id>`                 | Continue after a post-pick view scene.             |
 * | `ban:<kind>:<id>`                    | Ban an origin/class; reopen in 'banned' mode.      |
 * | `unban:<kind>:<id>`                  | Remove ban; reopen in resolved ban mode.           |
 * | `change:<kind>:<id>`                 | Open pick picker at id (continue-button callback). |
 * | `open:<kind>:<mode>[:<id>]`          | Open a picker fresh (mode 'ban' also accepted).    |
 * | `welcome:close:<state>`              | Close welcome; persist only if ignored.            |
 * | `welcome:ignore`                     | Toggle ignore tag on -- show alt.                  |
 * | `welcome:unignore`                   | Toggle ignore tag off -- show main.                |
 *
 * `<kind>` -- `race` | `class`.
 * `<mode>` -- `pick` | `pick_ban` | `pick_lock` | `change` | `view`
 *           | `banned` | `unbanned` | `ban_limit` | `ban_locked`.
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
			PlayerLifecycle.onJoinDialogueLoaded(player);
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
			case 'viewed': return this.handleViewed(player, parts);
			case 'ban': return this.handleBan(player, parts);
			case 'unban': return this.handleUnban(player, parts);
			case 'change': return this.handleChange(player, parts);
			case 'open': return this.handleOpen(player, parts);
			case 'open_options': return this.handleOpenOptions(player, parts);
			case 'toggle': return this.handleToggle(player, parts);
			case 'reset': return this.handleReset(player, parts);
			case 'evict_unselected': return this.handleEvictUnselected(player);
			case 'close': return this.handleClose(player);
			case 'wheel': return this.handleWheel(player, parts);
			case 'welcome': return this.handleWelcome(player, parts);
			default:
				this.log.warn(`unknown verb '${verb}' in '${message}'`);
		}
	}


	//#region HANDLERS

	public static handleClose(player: Player): void {
		player.onScreenDisplay.resetHudElementsVisibility();
	}

	private static handleNav(player: Player, [, kind, dir, id, mode]: string[]): void {
		if (!this.isKind(kind) || !this.isMode(mode)) return;
		if (dir !== 'prev' && dir !== 'next') return;
		if (!id || !isValidId(kind, id)) return;

		const next = neighborId(kind, mode, id, dir);

		// Determine the correct scene variant for the destination id.
		const targetMode: PickerMode = this.isBanContextMode(mode)
			? this.resolveBanMode(kind, next)
			: this.isPickContextMode(mode)
				? this.resolvePickMode(kind, next, player)
				: mode; // change / view: stay in same mode.

		UiBridge.openDialogue(player, pickerSceneTag(kind, targetMode, next));
	}

	private static handlePick(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id) return;
		if (id !== 'random' && !isValidId(kind, id)) return;

		const state = PlayerState.for(player);
		const resolved = id === 'random' ? this.rollRandom(kind) : id;
		if (kind === 'race') state.setOrigin(resolved);
		else state.setClass(resolved);

		PlayerLifecycle.applyOriginAndClass(player);

		UiBridge.openDialogue(player, pickerSceneTag(kind, 'view', resolved));
	}

	private static handleViewed(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id || !isValidId(kind, id)) return;

		const state = PlayerState.for(player);
		if (!state.getOrigin()) {
			const raceStart = defaultId('race');
			UiBridge.openDialogue(player, pickerSceneTag('race', this.resolvePickMode('race', raceStart, player), raceStart));
			return;
		}
		if (!state.getClass()) {
			const classStart = defaultId('class');
			UiBridge.openDialogue(player, pickerSceneTag('class', this.resolvePickMode('class', classStart, player), classStart));
			return;
		}

		this.handleClose(player);
	}

	private static handleBan(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id || !isValidId(kind, id)) return;
		const currentMode = this.resolveBanMode(kind, id);
		if (currentMode === 'ban_locked' || currentMode === 'ban_limit') {
			// Safety guard: blocked states should be non-interactive in the UI,
			// but defend against any edge-case script path reaching here.
			UiBridge.openDialogue(player, pickerSceneTag(kind, currentMode, id));
			return;
		}
		toggleBan(kind, id);
		// After banning, the mode for this id is now 'banned'.
		UiBridge.openDialogue(player, pickerSceneTag(kind, 'banned', id));
	}

	private static handleUnban(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id || !isValidId(kind, id)) return;
		toggleBan(kind, id); // removes ban
		// Re-resolve mode now that the ban has been lifted.
		UiBridge.openDialogue(player, pickerSceneTag(kind, this.resolveBanMode(kind, id), id));
	}

	private static handleChange(player: Player, [, kind, id]: string[]): void {
		if (!this.isKind(kind) || !id || !isValidId(kind, id)) return;
		// Open the pick picker at the current origin/class id. Does NOT commit or
		// clear state -- the player will do that via the select button in pick mode.
		UiBridge.openDialogue(player, pickerSceneTag(kind, this.resolvePickMode(kind, id, player), id));
	}

	private static handleOpen(player: Player, [, kind, mode, id]: string[]): void {
		if (!this.isKind(kind)) return;
		const target = id && isValidId(kind, id) ? id : defaultId(kind);
		// 'ban' is a virtual entry-point token -- resolve to the actual ban sub-mode.
		if (mode === 'ban') {
			UiBridge.openDialogue(player, pickerSceneTag(kind, this.resolveBanMode(kind, target), target));
			return;
		}
		if (!this.isMode(mode)) return;
		if (mode === 'pick') {
			UiBridge.openDialogue(player, pickerSceneTag(kind, this.resolvePickMode(kind, target, player), target));
			return;
		}
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
			case 'player': {
				PlayerState.for(player).reset();
				PlayerLifecycle.applyOriginAndClass(player);
				const raceStart = defaultId('race');
				UiBridge.openDialogue(player, pickerSceneTag('race', this.resolvePickMode('race', raceStart, player), raceStart));
				return;
			}
			case 'all':
				if (!this.isAdmin(player)) { UiBridge.openDialogue(player, 'gui_options_admin_denied'); return; }
				world.setDynamicProperty(WORLD_DPK.toggles, undefined);
				world.setDynamicProperty(WORLD_DPK.bans, undefined);
				resetAllToggles();
				for (const p of world.getAllPlayers()) {
					PlayerState.for(p).reset();
					PlayerLifecycle.applyOriginAndClass(p);
					const raceStart = defaultId('race');
					UiBridge.openDialogue(p, pickerSceneTag('race', this.resolvePickMode('race', raceStart, p), raceStart));
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
				const raceStart = defaultId('race');
				UiBridge.openDialogue(p, pickerSceneTag('race', this.resolvePickMode('race', raceStart, p), raceStart));
			}
		}
	}


	//#region WHEEL HANDLER

	private static handleWheel(player: Player, [, action, arg]: string[]): void {
		switch (action) {
			case 'slot': {
				const index = Number(arg);
				if (!Number.isInteger(index)) {
					this.log.warn(`wheel slot with non-integer index '${arg}'`);
					return;
				}
				AbilitySelector.handleSlot(player, index);
				return;
			}
			case 'close':
				AbilitySelector.close(player);
				this.handleClose(player);
				return;
			default:
				this.log.warn(`unknown wheel action '${action}'`);
		}
	}


	//#region WELCOME HANDLER

	private static handleWelcome(player: Player, [, action, state]: string[]): void {
		switch (action) {
			case 'close':
				PlayerState.for(player).setWelcomed(state === 'ignored');
				this.handleClose(player);
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
		return v === 'pick' || v === 'pick_ban' || v === 'pick_lock'
			|| v === 'change'
			|| v === 'view'
			|| v === 'banned' || v === 'unbanned'
			|| v === 'ban_limit' || v === 'ban_locked';
	}

	private static isBanContextMode(mode: PickerMode): boolean {
		return mode === 'banned' || mode === 'unbanned' || mode === 'ban_limit' || mode === 'ban_locked';
	}

	private static isPickContextMode(mode: PickerMode): boolean {
		return mode === 'pick' || mode === 'pick_ban' || mode === 'pick_lock';
	}

	/**
	 * Resolves the correct ban-management scene mode for a given origin/class id.
	 * Priority: already-banned > ban_locked (human + unique ON) > ban_limit > unbanned.
	 */
	private static resolveBanMode(kind: PickerKind, id: string): PickerMode {
		if (isBanned(kind, id)) return 'banned';
		if (kind === 'race' && id === 'human' && isToggleOn('unique')) return 'ban_locked';
		if (wouldBanLimitIfBanned(kind, id)) return 'ban_limit';
		return 'unbanned';
	}

	/**
	 * Resolves the correct pick-mode scene variant for a given origin/class id.
	 * Priority: random sentinel > banned > unique-locked > normal pick.
	 */
	private static resolvePickMode(kind: PickerKind, id: string, player: Player): PickerMode {
		if (id === 'random') return 'pick';
		if (isBanned(kind, id)) return 'pick_ban';
		if (isToggleOn('unique')) {
			const alreadyTaken = world.getAllPlayers().some((p) => {
				if (p.id === player.id) return false;
				const st = PlayerState.for(p);
				return kind === 'race' ? st.getOrigin() === id : st.getClass() === id;
			});
			if (alreadyTaken) return 'pick_lock';
		}
		return 'pick';
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
