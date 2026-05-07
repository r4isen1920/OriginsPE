import {
	Container,
	Entity,
	ItemStack,
	Player,
} from '@minecraft/server';

import { ENTITIES, ITEMS } from '../Constants';
import { Log } from '../utils/Log';
import { PlayerState } from '../core/PlayerState';
import { ItemUtils } from '../utils/ItemUtils';


//#region SERVICE

/**
 * Owns the ability-hotbar swap. The first 8 hotbar slots are stashed onto a
 * persistent dummy entity (`r4isen1920_originspe:inventory_keep`) tagged for
 * the owning player; the original slots are then replaced with locked padding
 * items used by the ability UI. {@link close} restores the snapshot.
 *
 * Replaces the legacy `controls.ts`. Uses {@link PlayerState} flags instead of
 * tags to track open/closed state.
 */
export class InventoryService {
	private static readonly log = Log.get('InventoryService');
	private static readonly HOTBAR_SIZE = 8;
	private static readonly OWNER_TAG_PREFIX = '_inventory_keep_';

	/** Returns true if the player currently has the ability hotbar open. */
	static isOpen(player: Player): boolean {
		return PlayerState.for(player).getFlag<boolean>('controls_opened') === true;
	}

	/** Opens the ability hotbar, stashing real items onto a dummy entity. */
	static open(player: Player): void {
		const playerInv = ItemUtils.container(player);
		if (!playerInv) return;

		const stash = this.getOrCreateStash(player);
		const stashInv = ItemUtils.container(stash);
		if (!stashInv) return;

		const padding = ItemUtils.lockedItem(ITEMS.menuPadding);
		for (let i = 0; i < this.HOTBAR_SIZE; i++) {
			stashInv.setItem(i, playerInv.getItem(i));
			playerInv.setItem(i, padding);
		}
		PlayerState.for(player).setFlag('controls_opened', true);
	}

	/** Closes the ability hotbar and restores the original items. */
	static close(player: Player): void {
		const playerInv = ItemUtils.container(player);
		if (!playerInv) return;
		const stash = this.getStash(player);
		if (stash) {
			const stashInv = ItemUtils.container(stash);
			if (stashInv) {
				for (let i = 0; i < this.HOTBAR_SIZE; i++) {
					this.restoreSlot(playerInv, stashInv, i);
				}
			}
		}
		PlayerState.for(player).setFlag('controls_opened', false);
	}


	//#region INTERNAL

	private static getStash(player: Player): Entity | undefined {
		const tags = [`${this.OWNER_TAG_PREFIX}${player.id}`, '_inventory_keep_hotbar'];
		const matches = player.dimension.getEntities({ type: ENTITIES.inventoryKeep, tags });
		if (matches.length === 0) return undefined;
		const e = matches[0];
		try { e.teleport(player.location, { dimension: player.dimension }); } catch { /* ignore */ }
		return e;
	}

	private static getOrCreateStash(player: Player): Entity {
		const existing = this.getStash(player);
		if (existing) return existing;
		const e = player.dimension.spawnEntity(ENTITIES.inventoryKeep, player.location);
		e.addTag(`${this.OWNER_TAG_PREFIX}${player.id}`);
		e.addTag('_inventory_keep_hotbar');
		return e;
	}

	private static restoreSlot(playerInv: Container, stashInv: Container, slot: number): void {
		const stashed = stashInv.getItem(slot);
		try {
			playerInv.setItem(slot, stashed);
			stashInv.setItem(slot, undefined);
		} catch (e: any) {
			this.log.error(`restoreSlot ${slot}: ${e?.stack ?? e}`);
		}
		// Suppress lint: we read but don't reuse the original ItemStack reference.
		void (stashed as ItemStack | undefined);
	}
}
