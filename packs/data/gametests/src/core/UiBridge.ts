import { Player, system, world } from '@minecraft/server';
import {
	ActionFormData,
	ActionFormResponse,
	MessageFormData,
	MessageFormResponse,
	ModalFormData,
	ModalFormResponse,
} from '@minecraft/server-ui';

import { Entities } from '../Files';
import { Log } from '../utils/Log';
import { PlayerState } from './PlayerState';


//#region TYPES

export type PickerKind = 'race' | 'class';
export type PickerMode = 'pick' | 'change' | 'view' | 'viewonly';


//#region UIBRIDGE

/**
 * Thin abstraction over the dialogue + form APIs. Owns the spawn/lifecycle of
 * the `dialogue_handler` entity and replaces every legacy `runDialogueCommand`
 * call from the old `gui.ts`.
 */
export class UiBridge {
	private static readonly log = Log.get('UiBridge');
	/** player.id -> tick at which the open dialogue is considered "ready". */
	private static readonly openHandles = new Map<string, number>();


	//#region DIALOGUE

	/**
	 * Opens the named NPC dialogue for `player`, spawning a transient handler
	 * entity nearby if one is not already in range. Internally retries every
	 * 4 ticks for up to ~1 second so the dialogue always lands even if the
	 * client is mid-transition.
	 */
	static openDialogue(player: Player, dialogueId: string): void {
		this.ensureHandler(player);

		const startedAt = system.currentTick;
		const handle = system.runInterval(() => {
			if (!player.isValid) { system.clearRun(handle); return; }
			try {
				player.runCommand(
					`dialogue open @e[type=${Entities.DialogueHandler},c=1] @s ${dialogueId}`,
				);
			} catch (e: any) {
				this.log.error(`openDialogue '${dialogueId}': ${e?.stack ?? e}`);
			}
			// Retry every 4 ticks for up to ~1 second (20 ticks), then stop.
			if (system.currentTick - startedAt >= 20) {
				this.openHandles.set(player.id, system.currentTick);
				system.clearRun(handle);
			}
		}, 4);
	}

	/** Opens the origin/class picker dialogue for the given player. */
	static openPicker(player: Player, kind: PickerKind, mode: PickerMode = 'pick'): void {
		const state = PlayerState.for(player);
		const current = kind === 'race' ? state.getOrigin() : state.getClass();
		const fallback = kind === 'race' ? 'human' : 'nitwit';
		const id = `gui_${kind}_${mode}_${current ?? fallback}`;

		this.openDialogue(player, id);

		switch (mode) {
			case 'pick':
				if (kind === 'race') state.setOrigin(undefined);
				else state.setClass(undefined);
				break;
			case 'view':
				player.playSound('ui.enchant', { volume: 1, pitch: 1.25 });
				break;
			default: break;
		}
	}


	//#region FORMS

	/** Awaitable wrapper around `ActionFormData.show`. */
	static async showAction(player: Player, build: (form: ActionFormData) => void): Promise<ActionFormResponse> {
		const form = new ActionFormData();
		build(form);
		return form.show(player);
	}

	/** Awaitable wrapper around `MessageFormData.show`. */
	static async showMessage(player: Player, build: (form: MessageFormData) => void): Promise<MessageFormResponse> {
		const form = new MessageFormData();
		build(form);
		return form.show(player);
	}

	/** Awaitable wrapper around `ModalFormData.show`. */
	static async showModal(player: Player, build: (form: ModalFormData) => void): Promise<ModalFormResponse> {
		const form = new ModalFormData();
		build(form);
		return form.show(player);
	}


	//#region INTERNAL

	private static ensureHandler(player: Player): void {
		const nearby = player.dimension.getEntities({
			type: Entities.DialogueHandler,
			location: player.location,
			maxDistance: 32,
		});
		if (nearby.length > 0) return;
		try {
			player.dimension.spawnEntity(Entities.DialogueHandler, {
				x: player.location.x,
				y: player.location.y + 1,
				z: player.location.z,
			});
		} catch (e: any) {
			this.log.error(`spawn dialogue_handler: ${e?.stack ?? e}`);
		}
	}

	/** No-op cleanup hook called from `Main.ts` when the world unloads. */
	static shutdown(): void {
		this.openHandles.clear();
		// Avoid unused-import lint when world isn't otherwise referenced.
		void world;
	}
}
