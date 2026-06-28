import {
	BlockPermutation,
	Direction,
	Player,
	PlayerBreakBlockAfterEvent,
	system
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { LOG_BLOCKS } from './TreeCapitator';
import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { MinecraftBlockTypes } from '@minecraft/vanilla-data';



/**
 * When chopping a tree, there is a chance a sapling will automatically be replanted.
 */
@RegisterPerk
export class GreenThumb implements Perk {
	readonly id = 'sapling_setblock';

	readonly SAPLING_MAP: Record<string, string> = {
		[MinecraftBlockTypes.AcaciaLog]: MinecraftBlockTypes.AcaciaSapling,
		[MinecraftBlockTypes.BirchLog]: MinecraftBlockTypes.BirchSapling,
		[MinecraftBlockTypes.CherryLog]: MinecraftBlockTypes.CherrySapling,
		[MinecraftBlockTypes.DarkOakLog]: MinecraftBlockTypes.DarkOakSapling,
		[MinecraftBlockTypes.JungleLog]: MinecraftBlockTypes.JungleSapling,
		[MinecraftBlockTypes.MangroveLog]: MinecraftBlockTypes.MangrovePropagule,
		[MinecraftBlockTypes.OakLog]: MinecraftBlockTypes.OakSapling,
		[MinecraftBlockTypes.SpruceLog]: MinecraftBlockTypes.SpruceSapling
	} as const;

	onBreakBlock(__player: Player, ev: PlayerBreakBlockAfterEvent): void {
		const { block, brokenBlockPermutation } = ev;

		const logBlock = LOG_BLOCKS.find((log) => brokenBlockPermutation.type.id === log);
		const saplingBlock = logBlock ? this.SAPLING_MAP[logBlock] : undefined;
		if (!logBlock || !saplingBlock) return;

		if (Math.random() < 0.8) return;

		//? we wait for the TreeCapitator to finish breaking the tree before we set the sapling back down,
		//? otherwise it will be destroyed immediately
		system.runTimeout(() => {
			const sapling = block.dimension.getBlockFromRay(Vec3.from(block.location), Vec3.Down, {
				maxDistance: 16,
				includeLiquidBlocks: false,
				includePassableBlocks: false
			});
			if (!sapling) return;

			const targetBlock = GreenThumb.getAdjacentBlock(sapling.block, sapling.face);
			if (!targetBlock) return;

			targetBlock.setPermutation(BlockPermutation.resolve(saplingBlock));

			const saplingLoc = sapling.block.center();
			block.dimension.spawnParticle('r4isen1920_originspe:experience_touch', saplingLoc);
			block.dimension.playSound('random.orb', saplingLoc, { volume: 0.25, pitch: 1.75 });
		}, 5); // should suffice
	}

	private static getAdjacentBlock(
		block: PlayerBreakBlockAfterEvent['block'],
		face: Direction
	): PlayerBreakBlockAfterEvent['block'] | undefined {
		switch (face) {
			case Direction.Up:
				return block.above();
			case Direction.Down:
				return block.below();
			case Direction.North:
				return block.north();
			case Direction.South:
				return block.south();
			case Direction.West:
				return block.west();
			case Direction.East:
				return block.east();
		}
	}
}
