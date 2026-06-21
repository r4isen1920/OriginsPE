import {
	Container,
	Entity,
	EntityEquippableComponent,
	EntityInventoryComponent,
	EquipmentSlot,
	ItemLockMode,
	ItemStack,
} from '@minecraft/server';


/** Result row for inventory queries. */
export interface InventorySlot {
	item: ItemStack | undefined;
	slot: number;
}


/**
 * Helpers for working with item stacks and inventories.
 */
export class ItemUtils {

	//#region INVENTORY

	/** Returns the inventory container for an entity, or `undefined`. */
	static container(entity: Entity): Container | undefined {
		const c = entity.getComponent('inventory') as EntityInventoryComponent | undefined;
		return c?.container;
	}

	/** Returns the equippable component for an entity, or `undefined`. */
	static equippable(entity: Entity): EntityEquippableComponent | undefined {
		return entity.getComponent('equippable') as EntityEquippableComponent | undefined;
	}

	/**
	 * Iterates the inventory and returns every slot whose item id matches `match`
	 * (substring match, like the legacy helper). Pass `'all'` to list every slot.
	 */
	static findAll(entity: Entity, match: string = 'all'): InventorySlot[] {
		const container = this.container(entity);
		if (!container) return [];
		const out: InventorySlot[] = [];
		for (let i = 0; i < container.size; i++) {
			const item = container.getItem(i);
			if (match === 'all' || item?.typeId.includes(match)) {
				out.push({ item, slot: i });
			}
		}
		return out;
	}

	/** Returns the first inventory slot whose item id matches `match`, or `undefined`. */
	static findFirst(entity: Entity, match: string): InventorySlot | undefined {
		const container = this.container(entity);
		if (!container) return undefined;
		for (let i = 0; i < container.size; i++) {
			const item = container.getItem(i);
			if (item?.typeId.includes(match)) return { item, slot: i };
		}
		return undefined;
	}

	/** Returns slots whose item id matches `match` and whose lore contains any string in `lore`. */
	static findWithLore(entity: Entity, match: string, lore: readonly string[]): InventorySlot[] {
		const slots = this.findAll(entity, match);
		return slots.filter((s) => s.item?.getLore().some((line) => lore.some((needle) => line.includes(needle))));
	}


	//#region MUTATION

	/**
	 * Decrements the stack at `slot` by `amount`. Removes the slot if depleted.
	 * Returns the new amount, or -1 if the slot was empty.
	 */
	static decrementStack(container: Container, slot: number, amount = 1): number {
		const item = container.getItem(slot);
		if (!item) return -1;
		const next = item.amount - amount;
		if (next <= 0) {
			container.setItem(slot, undefined);
			return 0;
		}
		item.amount = next;
		container.setItem(slot, item);
		return next;
	}

	/** Builds a slot-locked item stack (used for ability hotbar padding etc.). */
	static lockedItem(typeId: string, amount = 1): ItemStack {
		const item = new ItemStack(typeId, amount);
		item.lockMode = ItemLockMode.slot;
		return item;
	}

	/** Convenience to clear a slot. */
	static clearSlot(container: Container, slot: number): void {
		container.setItem(slot, undefined);
	}

	/** Convenience to read an equipment slot. */
	static getEquipment(entity: Entity, slot: EquipmentSlot): ItemStack | undefined {
		return this.equippable(entity)?.getEquipment(slot);
	}
}
