import {
	EntityComponentTypes,
	EntityEquippableComponent,
	EntityInventoryComponent,
	EquipmentSlot,
	ItemStack,
	Player,
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

@RegisterPower
export class Elegant implements Power {
	readonly id = 'elegant';
	readonly tickInterval = 2;

	private static readonly ALLOWED_ARMOR_PREFIX = 'minecraft:leather_';
	private static readonly ALLOWED_WEAPON_SUFFIX = 'bow';
	private static readonly DISALLOWED_WEAPON_PARTS = [
		'sword',
		'axe',
		'mace',
		'trident',
	];
	private static readonly MASTERY_EFFECT_TICKS = 40;

	onTick(player: Player): void {
		const equippable = player.getComponent(EntityComponentTypes.Equippable);
		const inventory = player.getComponent(EntityComponentTypes.Inventory);
		if (!equippable) return;

		this.enforceArmor(player, equippable, inventory);
		this.enforceWeapons(player, equippable);
		this.applyMasteryBonus(player, equippable);
	}

	onRelease(player: Player): void {
		player.removeEffect('minecraft:weakness');
		player.removeEffect(MinecraftEffectTypes.Speed);
	}

	private enforceArmor(
		player: Player,
		equippable: EntityEquippableComponent,
		inventory: EntityInventoryComponent | undefined,
	): void {
		const armorSlots = [
			EquipmentSlot.Head,
			EquipmentSlot.Chest,
			EquipmentSlot.Legs,
			EquipmentSlot.Feet,
		];

		for (const slot of armorSlots) {
			const armor = equippable.getEquipment(slot);
			if (!armor) continue;
			if (armor.typeId.startsWith(Elegant.ALLOWED_ARMOR_PREFIX)) continue;
			this.removeEquipment(player, equippable, slot, armor, inventory);
		}
	}

	private enforceWeapons(
		player: Player,
		equippable: EntityEquippableComponent,
	): void {
		const mainhand = equippable.getEquipment(EquipmentSlot.Mainhand);
		if (!mainhand) return;
		if (!this.isDisallowedWeapon(mainhand.typeId)) return;

		player.addEffect(MinecraftEffectTypes.Weakness, 20, {
			amplifier: 255,
			showParticles: false
		});
	}

	private isDisallowedWeapon(typeId: string): boolean {
		if (typeId.endsWith(Elegant.ALLOWED_WEAPON_SUFFIX)) return false;
		return Elegant.DISALLOWED_WEAPON_PARTS.some((part) => typeId.includes(part));
	}

	private removeEquipment(
		player: Player,
		equippable: EntityEquippableComponent,
		slot: EquipmentSlot,
		item: ItemStack,
		inventory: EntityInventoryComponent | undefined,
	): void {
		equippable.setEquipment(slot, undefined);

		const leftover = inventory?.container?.addItem(item);
		if (leftover) {
			player.dimension.spawnItem(leftover, player.location);
		}

		player.playSound('random.break', { volume: 0.6, pitch: 1.3 });
	}

	private applyMasteryBonus(player: Player, equippable: EntityEquippableComponent): void {
		const mainhand = equippable.getEquipment(EquipmentSlot.Mainhand);
		if (!mainhand?.typeId.endsWith(Elegant.ALLOWED_WEAPON_SUFFIX)) {
			player.removeEffect(MinecraftEffectTypes.Speed);
			return;
		}

		const armorSlots = [
			EquipmentSlot.Head,
			EquipmentSlot.Chest,
			EquipmentSlot.Legs,
			EquipmentSlot.Feet,
		];

		const hasFullLeather = armorSlots.every((slot) => {
			const armor = equippable.getEquipment(slot);
			return armor !== undefined && armor.typeId.startsWith(Elegant.ALLOWED_ARMOR_PREFIX);
		});

		if (!hasFullLeather) {
			player.removeEffect(MinecraftEffectTypes.Speed);
			return;
		}

		player.addEffect(MinecraftEffectTypes.Speed, Elegant.MASTERY_EFFECT_TICKS, {
			amplifier: 0,
			showParticles: false,
		});
	}
}
