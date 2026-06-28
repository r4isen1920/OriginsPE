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
import { MinecraftBlockTypes } from '@minecraft/vanilla-data';



//#region Constants
export const LOG_BLOCKS = [
	MinecraftBlockTypes.AcaciaLog,
	MinecraftBlockTypes.BirchLog,
	MinecraftBlockTypes.CherryLog,
	MinecraftBlockTypes.CrimsonStem,
	MinecraftBlockTypes.DarkOakLog,
	MinecraftBlockTypes.JungleLog,
	MinecraftBlockTypes.MangroveLog,
	MinecraftBlockTypes.OakLog,
	MinecraftBlockTypes.SpruceLog,
	MinecraftBlockTypes.WarpedStem
];

const DIRECTIONS = ['north', 'south', 'west', 'east', 'above', 'below'] as const;
type NeighborDirection = (typeof DIRECTIONS)[number];

const MAX_CHAIN_DEPTH = 27;
const MAX_CHAIN_BLOCKS = 512;



//#region Perk
@RegisterPerk
export class TreeCapitator implements Perk {
	readonly id = 'tree_felling';

	onBreakBlock(player: Player, ev: PlayerBreakBlockAfterEvent): void {
		const { block, brokenBlockPermutation } = ev;

		if (player.isSneaking) return;
		if (player.matches({ gameMode: GameMode.Creative })) return;

		const heldItem = player
			.getComponent(EntityComponentTypes.Equippable)
			?.getEquipment(EquipmentSlot.Mainhand);
		if (!heldItem || !heldItem.hasTag('minecraft:is_axe')) return;

		const logBlock = LOG_BLOCKS.find((log) => brokenBlockPermutation.type.id === log);
		if (!logBlock) return;

		const queue: Array<{ block: Block; depth: number }> = [];
		const visited = new Set<string>();

		DIRECTIONS.forEach((direction) => {
			const neighbor = TreeCapitator.getNeighborBlock(block, direction);
			if (!neighbor) return;

			queue.push({ block: neighbor, depth: 0 });
		});

		for (let index = 0, mined = 0; index < queue.length && mined < MAX_CHAIN_BLOCKS; index++) {
			const { block: currentBlock, depth } = queue[index];
			if (depth > MAX_CHAIN_DEPTH) continue;

			const key = TreeCapitator.blockKey(currentBlock);
			if (visited.has(key)) continue;
			visited.add(key);

			if (currentBlock.typeId !== logBlock) continue;

			currentBlock.dimension.runCommand(
				`setblock ${currentBlock.x} ${currentBlock.y} ${currentBlock.z} air [] destroy`
			);
			player.dimension.spawnParticle('r4isen1920_originspe:vein_mine', currentBlock.center());
			TreeCapitator.teleportDropsToPlayer(currentBlock, player, logBlock);
			mined++;

			const nextDepth = depth + 1;
			if (nextDepth > MAX_CHAIN_DEPTH) continue;

			DIRECTIONS.forEach((direction) => {
				const neighbor = TreeCapitator.getNeighborBlock(currentBlock, direction);
				if (!neighbor) return;
				queue.push({ block: neighbor, depth: nextDepth });
			});
		}
	}

	private static teleportDropsToPlayer(block: Block, player: Player, targetBlock: string): void {
		block.dimension
			.getEntities({
				location: block.location,
				maxDistance: 5,
				type: 'minecraft:item'
			})
			.forEach((itemEntity) => {
				const itemComp = itemEntity.getComponent(EntityComponentTypes.Item) as
					| EntityItemComponent
					| undefined;
				if (!itemComp?.itemStack.typeId.includes(targetBlock)) return;
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
