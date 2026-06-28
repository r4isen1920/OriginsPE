import {
	Block,
	EntityComponentTypes,
	EntityItemComponent,
	EquipmentSlot,
	GameMode,
	Player,
	PlayerBreakBlockAfterEvent
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { MinecraftBlockTypes } from '@minecraft/vanilla-data';



//# region Constants
const ORE_BLOCKS = [
	MinecraftBlockTypes.AncientDebris,
	MinecraftBlockTypes.CoalOre,
	MinecraftBlockTypes.CopperOre,
	MinecraftBlockTypes.DeepslateCoalOre,
	MinecraftBlockTypes.DeepslateDiamondOre,
	MinecraftBlockTypes.DeepslateEmeraldOre,
	MinecraftBlockTypes.DeepslateGoldOre,
	MinecraftBlockTypes.DeepslateIronOre,
	MinecraftBlockTypes.DeepslateLapisOre,
	MinecraftBlockTypes.DeepslateRedstoneOre,
	MinecraftBlockTypes.LitDeepslateRedstoneOre,
	MinecraftBlockTypes.DiamondOre,
	MinecraftBlockTypes.EmeraldOre,
	MinecraftBlockTypes.GoldOre,
	MinecraftBlockTypes.IronOre,
	MinecraftBlockTypes.LapisOre,
	MinecraftBlockTypes.NetherGoldOre,
	MinecraftBlockTypes.QuartzOre,
	MinecraftBlockTypes.RedstoneOre,
	MinecraftBlockTypes.LitRedstoneOre,
];

const DIRECTIONS = ['north', 'south', 'west', 'east', 'above', 'below'] as const;
type NeighborDirection = (typeof DIRECTIONS)[number];

const MAX_CHAIN_DEPTH = 27;
const MAX_CHAIN_BLOCKS = 512;



//#region Perk
@RegisterPerk
export class OreVeinMiner implements Perk {
	readonly id = 'ore_vein_miner';

	onBreakBlock(player: Player, ev: PlayerBreakBlockAfterEvent): void {
		const { block, brokenBlockPermutation } = ev;

		if (!PlayerState.for(player).hasPerk('ore_vein_miner')) return;
		if (player.isSneaking) return;
		if (player.matches({ gameMode: GameMode.Creative })) return;

		const heldItem = player
			.getComponent(EntityComponentTypes.Equippable)
			?.getEquipment(EquipmentSlot.Mainhand);
		if (!heldItem?.typeId.includes('_pickaxe')) return;

		const oreBlock = ORE_BLOCKS.find((ore) =>
			brokenBlockPermutation.matches(ore)
		);
		if (!oreBlock) return;

		const queue: Array<{ block: Block; depth: number }> = [];
		const visited = new Set<string>();

		DIRECTIONS.forEach((direction) => {
			const neighbor = OreVeinMiner.getNeighborBlock(block, direction);
			if (!neighbor) return;

			queue.push({ block: neighbor, depth: 0 });
		});

		for (let index = 0, mined = 0; index < queue.length && mined < MAX_CHAIN_BLOCKS; index++) {
			const { block: currentBlock, depth } = queue[index];
			if (depth > MAX_CHAIN_DEPTH) continue;

			const key = OreVeinMiner.blockKey(currentBlock);
			if (visited.has(key)) continue;
			visited.add(key);

			if (!currentBlock.permutation.matches(oreBlock)) continue;

			currentBlock.dimension.runCommand(
				`setblock ${currentBlock.x} ${currentBlock.y} ${currentBlock.z} air [] destroy`
			);
			player.dimension.spawnParticle('r4isen1920_originspe:vein_mine', currentBlock.center());
			OreVeinMiner.teleportDropsToPlayer(currentBlock, player, oreBlock);
			mined++;

			const nextDepth = depth + 1;
			if (nextDepth > MAX_CHAIN_DEPTH) continue;

			DIRECTIONS.forEach((direction) => {
				const neighbor = OreVeinMiner.getNeighborBlock(currentBlock, direction);
				if (!neighbor) return;
				queue.push({ block: neighbor, depth: nextDepth });
			});
		}
	}

	private static teleportDropsToPlayer(block: Block, player: Player, targetBlock: string): void {
		const itemHint = targetBlock
			.replace('lit_', '')
			.replace('deepslate_', '')
			.replace('_ore', '');

		block.dimension
			.getEntities({
				location: block.location,
				maxDistance: 5,
				type: 'minecraft:item'
			})
			.forEach((itemEntity) => {
				const itemComp = itemEntity.getComponent(EntityComponentTypes.Item);
				if (!itemComp) return;

				const itemTypeId = itemComp.itemStack.typeId;
				if (!itemTypeId.includes(itemHint)) return;
				itemEntity.teleport(player.location);
			});
	}

	private static blockKey(block: Block): string {
		return `${block.x},${block.y},${block.z}`;
	}

	private static getNeighborBlock(block: Block, direction: NeighborDirection): Block | undefined {
		switch (direction) {
			case 'north':
				return block.north();
			case 'south':
				return block.south();
			case 'west':
				return block.west();
			case 'east':
				return block.east();
			case 'above':
				return block.above();
			case 'below':
				return block.below();
		}
	}
}
