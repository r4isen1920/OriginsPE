import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import {
	Block,
	BlockPermutation,
	Player,
	PlayerPlaceBlockAfterEvent,
	ItemStack,
	world,
	system
} from '@minecraft/server';
import { Log } from '../../utils/Log';
import { PlayerState } from '../../core/platform/PlayerState';
import { OnWorldLoad } from '@bedrock-oss/stylish';

@RegisterPower
export class MasterOfWebs implements Power {
	readonly id = 'master_of_webs';
	readonly tickInterval = 1;

	private static readonly log = Log.get('MasterOfWebs');

	private static readonly FAKE_COBWEB = 'r4isen1920_originspe:fake_cobweb';
	private static readonly REAL_COBWEB = 'minecraft:web';

	private static readonly trackedWebs = new Map<string, BlockPermutation>();

	private static key(block: Block): string {
		const { x, y, z } = block.location;
		return `${x},${y},${z},${block.dimension.id}`;
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		const inventory = player.getComponent('minecraft:inventory');
		if (inventory?.container) {
			const container = inventory.container;

			const selectedSlot = player.selectedSlotIndex;
			const selectedItem = container.getItem(selectedSlot);
			const isPlacing = selectedItem?.typeId === MasterOfWebs.FAKE_COBWEB;

			for (let slot = 0; slot < container.size; slot++) {
				if (isPlacing && slot === selectedSlot) continue;

				const item = container.getItem(slot);
				if (item?.typeId === MasterOfWebs.REAL_COBWEB) {
					container.setItem(slot, new ItemStack(MasterOfWebs.FAKE_COBWEB, item.amount));
				}
			}
		}

		const dim = player.dimension;
		const loc = player.location;

		const fx = Math.floor(loc.x);
		const fy = Math.floor(loc.y);
		const fz = Math.floor(loc.z);

		const currentBlocks = [
			dim.getBlock({ x: fx, y: fy, z: fz }),
			dim.getBlock({ x: fx, y: fy + 1, z: fz })
		];

		const currentKeys = new Set<string>();

		for (const block of currentBlocks) {
			if (!block?.isValid) continue;

			if (block.typeId === MasterOfWebs.REAL_COBWEB) {
				const k = MasterOfWebs.key(block);
				currentKeys.add(k);

				if (!MasterOfWebs.trackedWebs.has(k)) {
					MasterOfWebs.trackedWebs.set(k, block.permutation);
					block.setPermutation(BlockPermutation.resolve(MasterOfWebs.FAKE_COBWEB));
				}
			} else if (block.typeId === MasterOfWebs.FAKE_COBWEB) {
				const k = MasterOfWebs.key(block);
				currentKeys.add(k);
			}
		}

		for (const [k, originalPermutation] of MasterOfWebs.trackedWebs) {
			if (currentKeys.has(k)) continue;

			const [x, y, z, dimId] = k.split(',');
			if (dimId !== dim.id) continue;

			const b = dim.getBlock({
				x: Number(x),
				y: Number(y),
				z: Number(z)
			});

			if (
				b?.isValid &&
				(b.typeId === MasterOfWebs.FAKE_COBWEB || b.typeId === MasterOfWebs.REAL_COBWEB)
			) {
				b.setPermutation(originalPermutation);
			}

			MasterOfWebs.trackedWebs.delete(k);
		}
	}

	onPlaceBlock(player: Player, ev: PlayerPlaceBlockAfterEvent): void {
		const state = PlayerState.for(player);
		if (!state.hasPower('master_of_webs')) return;
		const block = ev.block;
		if (!block?.isValid) return;
		if (block.typeId !== MasterOfWebs.REAL_COBWEB) return;

		block.setPermutation(BlockPermutation.resolve(MasterOfWebs.FAKE_COBWEB));
	}

	onUnload(player: Player): void {
		for (const [k, originalPermutation] of MasterOfWebs.trackedWebs) {
			const [x, y, z, dimId] = k.split(',');
			if (dimId !== player.dimension.id) continue;

			const b = player.dimension.getBlock({
				x: Number(x),
				y: Number(y),
				z: Number(z)
			});

			if (b?.isValid) b.setPermutation(originalPermutation);
		}

		MasterOfWebs.trackedWebs.clear();
	}

	@OnWorldLoad
	static onWorldLoad(): void {
		system.runInterval(() => {
			for (const player of world.getAllPlayers()) {
				if (!player.isValid) continue;

				const state = PlayerState.for(player);
				if (!state || !state.hasPower('master_of_webs')) {
					const inventory = player.getComponent('minecraft:inventory');
					if (!inventory?.container) continue;

					const container = inventory.container;
					for (let slot = 0; slot < container.size; slot++) {
						const item = container.getItem(slot);
						if (item?.typeId === MasterOfWebs.FAKE_COBWEB) {
							container.setItem(
								slot,
								new ItemStack(MasterOfWebs.REAL_COBWEB, item.amount)
							);
						}
					}
				}
			}
		}, 20);
	}
}
