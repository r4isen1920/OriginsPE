import { EntityComponentTypes, EquipmentSlot, ItemComponentMineBlockEvent, ItemComponentTypes, ItemCustomComponent, ItemStack, Player } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { EntityUtils, Log } from '../../utils';
import { ItemBonuses } from '../../core/platform/ItemBonuses';

import blacksmith_tools from '../../../../jsonte/blacksmith_tools.json';
import { BindThis, ItemComponent } from '@bedrock-oss/stylish';
import { MinecraftEnchantmentTypes } from '@minecraft/vanilla-data';



@RegisterPerk
export class QualityEquipment implements Perk {
	private static readonly log = Log.get('QualityEquipment');

	readonly id = 'quality_equipment';
	readonly tickInterval = 2;
	
	
	//#region Data

	private static readonly VANILLA_NAMESPACE = 'minecraft:';
	private static readonly FORGED_PREFIX = 'r4isen1920_originspe:enhanced_';

	private static readonly affectedItems: ReadonlySet<string> = new Set(
		(blacksmith_tools.blacksmith_tools as readonly BlacksmithTool[]).map(
			tool => `${QualityEquipment.VANILLA_NAMESPACE}${QualityEquipment.nameOf(tool)}`,
		),
	);

	private static nameOf({ material, type }: BlacksmithTool): string {
		return material ? `${material}_${type}` : type;
	}


	//#region Apply

	onTick(player: Player): void {
		const container = EntityUtils.getComponent(player, EntityComponentTypes.Inventory)?.container;
		if (!container) return;

		const inventory = EntityUtils.getInventory(player);
		if (!inventory) return;

		for (const [slot, item] of inventory) {
			const forged = QualityEquipment.forge(item);
			if (!forged) continue;

			container.setItem(slot, forged);
			QualityEquipment.log.info(`Item forged: ${item.typeId} -> ${forged.typeId} in slot ${slot} for player ${player.name}`);
		}
	}


	//#region Forging

	/**
	 * Builds the forged counterpart of a pristine vanilla item, or `undefined`
	 * when the item is not eligible.
	 */
	private static forge(item: ItemStack): ItemStack | undefined {
		if (!QualityEquipment.affectedItems.has(item.typeId)) return undefined;
		if (!QualityEquipment.isPristine(item)) return undefined;

		const forgedId = `${QualityEquipment.FORGED_PREFIX}${item.typeId.slice(QualityEquipment.VANILLA_NAMESPACE.length)}`;

		try {
			const forged = new ItemStack(forgedId, item.amount);
			ItemBonuses.write(forged, ['quality_equipment']);
			forged.keepOnDeath = item.keepOnDeath;
			forged.lockMode = item.lockMode;
			return forged;
		} catch (e) {
			QualityEquipment.log.error(`Failed to forge ${item.typeId} into ${forgedId}: ${e}`);
			return undefined;
		}
	}

	/**
	 * An item only qualifies while it is still exactly as crafted: undamaged,
	 * unenchanted, unrenamed, and carrying no lore.
	 */
	private static isPristine(item: ItemStack): boolean {
		if (item.nameTag !== undefined) return false;
		if (item.getRawLore().length > 0) return false;

		const durability = item.getComponent(ItemComponentTypes.Durability);
		if (durability && durability.damage > 0) return false;

		const enchantable = item.getComponent(ItemComponentTypes.Enchantable);
		if (enchantable && enchantable.getEnchantments().length > 0) return false;

		return true;
	}
}



//#region Tool Reimpl.
@ItemComponent
export class BlacksmithToolItem implements ItemCustomComponent {
	public static readonly componentId = 'r4isen1920_originspe:blacksmith_tool';

	private static readonly log = Log.get('BlacksmithToolItem');

	@BindThis
	onMineBlock(event: ItemComponentMineBlockEvent): void {
		const { itemStack, source } = event;
		if (!(source instanceof Player)) return;	
		if (!itemStack) return;

		const durability = itemStack.getComponent(ItemComponentTypes.Durability);
		if (!durability) return;

		const unbreakingLv = itemStack.getComponent(ItemComponentTypes.Enchantable)
			?.getEnchantment(MinecraftEnchantmentTypes.Unbreaking)
			?.level ?? 0;
		const chance = durability.getDamageChance(unbreakingLv) / 100;

		const equippable = EntityUtils.getComponent(source, EntityComponentTypes.Equippable)
		if (!equippable) return;

		// BlacksmithToolItem.log.debug(`Item: ${itemStack.typeId}, unbreaking: ${unbreakingLv}, chance: ${chance}`);

		if (Math.random() <= chance) {
			if (durability.damage >= durability.maxDurability) {
				equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
				source.dimension.playSound('random.break', source.location);
				return;
			}
			durability.damage = Math.min(durability.damage + 1, durability.maxDurability)	;
		}

		equippable.setEquipment(EquipmentSlot.Mainhand, itemStack);
	}
}



//#region Types
/**
 * Represents a tool or piece of gear that can be forged by the Blacksmith item templates.
 */
interface BlacksmithTool {
	/**
	 * Material in which this tool is made of.
	 * If none, assumes it is a generic tool like a bow or shears.
	 */
	material?: string;
	/** The specific type of the tool. */
	type: string;
}
