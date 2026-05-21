import { Player, system, ItemStack, EquipmentSlot, GameMode, world } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Teleportation: Allows the player to teleport to a targeted location within a certain range.
 */

@RegisterPower
export class Teleportation implements Power {
	readonly id = 'teleportation';
	private static readonly log = Log.get('Teleportation');
	private static readonly PEARL_LORE = '§r§5Enderian Rift Pearl§r';

	constructor() {
		world.beforeEvents.itemUse.subscribe((event) => {
			try {
				const { itemStack, source: player } = event;
				if (itemStack.typeId !== 'minecraft:ender_pearl') return;

				const state = PlayerState.for(player);
				if (state.getOrigin() !== 'enderian') return;

				event.cancel = true;

				system.run(() => {
					const currentTick = system.currentTick;
					const onCooldown = state.isOnCooldown('teleportation_cooldown', currentTick);

					if (onCooldown) {
						try {
							player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
							const expiryTick =
								state.getFlag<number>('teleportation_expiry') ?? currentTick;
							const ticksLeft = expiryTick - currentTick;
							if (ticksLeft > 0) {
								const secondsLeft = (ticksLeft / 20).toFixed(1);
								player.sendMessage(
									`§cTeleportation is on cooldown! §e${secondsLeft}s §cleft.`
								);
							}
						} catch {}
						return;
					}

					const targetBlockRay = player.getBlockFromViewDirection({
						maxDistance: 64,
						includeLiquidBlocks: false
					});

					if (!targetBlockRay) {
						try {
							player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
						} catch {}
						return;
					}

					const block = targetBlockRay.block;
					const face = targetBlockRay.face;
					let targetLocation = block.location;

					switch (face) {
						case 'Down':
							targetLocation = {
								x: block.location.x,
								y: block.location.y - 1,
								z: block.location.z
							};
							break;
						case 'Up':
							targetLocation = {
								x: block.location.x,
								y: block.location.y + 1,
								z: block.location.z
							};
							break;
						case 'North':
							targetLocation = {
								x: block.location.x,
								y: block.location.y,
								z: block.location.z - 1
							};
							break;
						case 'South':
							targetLocation = {
								x: block.location.x,
								y: block.location.y,
								z: block.location.z + 1
							};
							break;
						case 'West':
							targetLocation = {
								x: block.location.x - 1,
								y: block.location.y,
								z: block.location.z
							};
							break;
						case 'East':
							targetLocation = {
								x: block.location.x + 1,
								y: block.location.y,
								z: block.location.z
							};
							break;
					}

					try {
						player.dimension.playSound('mob.endermen.portal', player.location);
						player.dimension.playSound('mob.endermen.portal', targetLocation);
					} catch {}

					player.teleport(targetLocation, { dimension: block.dimension });

					state.setCooldown('teleportation_cooldown', currentTick, 100);
					state.setFlag('teleportation_expiry', currentTick + 100);
				});
			} catch (error: any) {
				Teleportation.log.error(
					`Error inside Teleportation item use handler: ${error?.stack ?? error}`
				);
			}
		});
	}

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			const inventoryComp = player.getComponent('inventory');
			if (!inventoryComp?.container) return;

			let totalPearlCount = 0;
			let customPearlSlot = -1;

			for (let i = 0; i < inventoryComp.container.size; i++) {
				const item = inventoryComp.container.getItem(i);
				if (!item || item.typeId !== 'minecraft:ender_pearl') continue;

				totalPearlCount += item.amount;
				const lore = item.getLore();
				if (lore && lore.includes(Teleportation.PEARL_LORE)) {
					customPearlSlot = i;
				}
			}

			if (state.getOrigin() !== 'enderian') {
				if (customPearlSlot !== -1) {
					inventoryComp.container.setItem(customPearlSlot, undefined);
				}
				return;
			}

			if (totalPearlCount === 0) {
				const newPearl = new ItemStack('minecraft:ender_pearl', 1);
				newPearl.setLore([Teleportation.PEARL_LORE]);
				inventoryComp.container.addItem(newPearl);

				try {
					player.playSound('note.pling', { volume: 0.1, pitch: 1.5 });
				} catch {}
			} else if (totalPearlCount > 1 && customPearlSlot !== -1) {
				const customPearl = inventoryComp.container.getItem(customPearlSlot);
				if (customPearl) {
					customPearl.amount = 1;
					inventoryComp.container.setItem(customPearlSlot, customPearl);
				}
			}
		} catch (error: any) {
			Teleportation.log.error(
				`Error inside Teleportation tick handler: ${error?.stack ?? error}`
			);
		}
	}
}
