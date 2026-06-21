import { HudElement, Player, system, world } from '@minecraft/server';
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
import { PlayerState } from '../core/platform/PlayerState';
import { buildPayload, pickerSceneTag, PickerKind, PickerMode } from './UiPayload';
import { ResourceBarService } from '../services/ResourceBarService';
import { Registry } from '../core/platform/Registry';
import { getDifficulty } from './PickerRegistry';


//#region UIBRIDGE

/**
 * Thin abstraction over the dialogue + form APIs.
 * Owns the spawn/lifecycle of the `dialogue_handler` entity.
 */
export class UiBridge {
	private static readonly log = Log.get('UiBridge', 'ui');


	//#region DIALOGUE

	/**
	 * Opens the named NPC dialogue for `player`, spawning a transient handler
	 * entity nearby if one is not already in range.
	 */
	static async openDialogue(player: Player, dialogueId: string): Promise<void> {
		await this.ensureHandler(player);

		ResourceBarService.suspend(player, dialogueId === 'gui_welcome_screen');
		player.onScreenDisplay.hideAllExcept();

		UI_DEBUG: {
			this.log.debug(`Open: '${dialogueId}', for: ${player.name}`);
		}

		try {
			player.runCommand(
				`dialogue open @e[type=${Entities.DialogueHandler},c=1] @s ${dialogueId}`,
			);
		} catch (e: any) {
			this.log.error(`openDialogue '${dialogueId}': `, e);
		}

		return await system.waitTicks(1);
	}

	/** Restores HUD elements and resumes the resource bar after a UI screen closes. */
	static closeScreen(player: Player): void {
		player.onScreenDisplay.resetHudElementsVisibility();
		ResourceBarService.resume(player);
	}

	/** Opens the origin/class picker dialogue for the given player. */
	static async openPicker(player: Player, kind: PickerKind, mode: PickerMode = PickerMode.Pick): Promise<void> {
		const state = PlayerState.for(player);
		const current = kind === PickerKind.Race ? state.getOrigin() : state.getClass();
		const fallback = kind === PickerKind.Race ? 'human' : 'nitwit';
		const id = pickerSceneTag(kind, mode, current ?? fallback);

		player.onScreenDisplay.setTitle(
			buildPayload(mode, kind, getDifficulty(kind, current ?? fallback), current ?? fallback),
			{
				fadeInDuration: 0,
				stayDuration: 0,
				fadeOutDuration: 0,
			}
		);

		await this.openDialogue(player, id);

		switch (mode) {
			case PickerMode.Pick:
				if (kind === PickerKind.Race) state.setOrigin(undefined);
				else state.setClass(undefined);
				break;
			case PickerMode.View:
				player.playSound('ui.enchant', { volume: 1, pitch: 1.25 });
				break;
			default: break;
		}
	}

	private static async ensureHandler(player: Player): Promise<void> {
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
			this.log.error(`spawn dialogue_handler: `, e);
		}

		return await system.waitTicks(1);
	}
}
