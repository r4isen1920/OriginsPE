import { BindThis, BlockComponent } from '@bedrock-oss/stylish';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import {
	BlockCustomComponent,
	BlockComponentTickEvent,
	BlockPermutation,
	Player,
	PlayerPlaceBlockAfterEvent,
	Dimension,
	Vector3,
	BlockVolume,
} from '@minecraft/server';
import { Ticker } from '../../core/platform/Ticker';
import { Log } from '../../utils/Log';
import { PlayerState } from '../../core/platform/PlayerState';
import { BlockStateSuperset, MinecraftBlockTypes } from '@minecraft/vanilla-data';
import { Vec3 } from '@bedrock-oss/bedrock-boost';

import { Blocks } from '../../Files';



//#region FakeCobweb Block

/**
 * Block custom component for the fake cobweb block.
 * On each tick, checks whether any Arachnid player is within the bubble. If not,
 * restores to a vanilla cobweb. Also applies slowness effects to non-exempt entities.
 */
@BlockComponent
export class FakeCobweb implements BlockCustomComponent {
	static readonly componentId = 'r4isen1920_originspe:fake_cobweb';
	private static readonly log = Log.get('MasterOfWebs', 'FakeCobweb');

	public static readonly BUBBLE_RADIUS = 1;

	@BindThis
	onTick(event: BlockComponentTickEvent): void {
		const { block, dimension } = event;
		if (!block?.isValid) return;

		this.slowEntities(dimension, block.location);

		const loc = Vec3.from(block.location);
		const hasNearbyArachnid = Ticker.getPlayers().some((player) => {
			if (!player.isValid) return false;
			if (!PlayerState.for(player).hasPower('master_of_webs')) return false;
			const playerFloor = Vec3.from(player.location).floor();
			const diff = loc.subtract(playerFloor);
			return (
				Math.abs(diff.x) <= FakeCobweb.BUBBLE_RADIUS &&
				Math.abs(diff.y) <= FakeCobweb.BUBBLE_RADIUS &&
				Math.abs(diff.z) <= FakeCobweb.BUBBLE_RADIUS
			);
		});

		if (!hasNearbyArachnid) {
			block.setType(MinecraftBlockTypes.Web);
			// FakeCobweb.log.debug(`Cobweb restored at: ${loc.x},${loc.y},${loc.z}`);
		}
	}

	private slowEntities(dimension: Dimension, location: Vector3): void {
		dimension.getEntitiesAtBlockLocation(location).forEach((entity) => {
			if (entity instanceof Player) {
				const state = PlayerState.for(entity);
				if (state.hasPower('webbing') || state.hasPower('master_of_webs')) return;
			}
			entity.addEffect('slowness', 5, { amplifier: 4, showParticles: false });
			entity.addEffect('slow_falling', 5, { amplifier: 4, showParticles: false });
		});
	}
}



//#region MasterOfWebs Power

/** Arachnid can walk through cobwebs unimpeded, like spiders. */
@RegisterPower
export class MasterOfWebs implements Power {
	readonly id = 'master_of_webs';
	readonly tickInterval = 1;

	private static readonly log = Log.get('MasterOfWebs');

	onTick(player: Player): void {
		if (!player.isValid) return;
		if (!PlayerState.for(player).hasPower('master_of_webs')) return;

		const dim = player.dimension;
		const flooredLoc = Vec3.from(player.location).floor();
		const blockVolume = new BlockVolume(
			flooredLoc.add(FakeCobweb.BUBBLE_RADIUS),
			flooredLoc.subtract(FakeCobweb.BUBBLE_RADIUS)
		);
		dim.fillBlocks(blockVolume, Blocks.FakeCobweb, {
			blockFilter: {
				includeTypes: [MinecraftBlockTypes.Web],
			},
			ignoreChunkBoundErrors: true,
		});
	}

	onPlaceBlock(player: Player, ev: PlayerPlaceBlockAfterEvent): void {
		if (!PlayerState.for(player).hasPower('master_of_webs')) return;
		const block = ev.block;
		if (!block?.isValid || block.typeId !== MinecraftBlockTypes.Web) return;
		block.setPermutation(
			BlockPermutation.resolve(Blocks.FakeCobweb, {
				'r4isen1920_originspe:is_from_attack': false,
			})
		);
		MasterOfWebs.log.debug(`Placed cobweb converted at: ${block.location.x},${block.location.y},${block.location.z}`);
	}
}
