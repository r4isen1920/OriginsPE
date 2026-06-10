import { Player, system, ItemStack, world } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { BeforeItemUse } from '../../core/DecoratedEvents';

@RegisterPower
export class Teleportation implements Power {
	readonly id = 'throw_ender_pearl';
	readonly icon = '03';
	readonly tickInterval = 3;

	private static readonly PEARL_LORE = '§r§5Enderian Rift Pearl§r';

	@BeforeItemUse
	static onItemUse(event: any): void {
		const { itemStack, source: player } = event;
		if (itemStack.typeId !== 'minecraft:ender_pearl') return;

		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'enderian') return;

		event.cancel = true;

		system.run(() => {
			const currentTick = system.currentTick;
			const onCooldown = state.isOnCooldown('teleportation_cooldown', currentTick);

			if (onCooldown) {
				player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
				const expiryTick = state.getFlag<number>('teleportation_expiry') ?? currentTick;
				const ticksLeft = expiryTick - currentTick;
				if (ticksLeft > 0) {
					const secondsLeft = (ticksLeft / 20).toFixed(1);
					player.sendMessage(`§cTeleportation is on cooldown! §e${secondsLeft}s §cleft.`);
				}
				return;
			}

			const targetBlockRay = player.getBlockFromViewDirection({
				maxDistance: 64,
				includeLiquidBlocks: false
			});

			if (!targetBlockRay) {
				player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
				return;
			}

			const { block, face } = targetBlockRay;
			let targetLocation = { ...block.location };

			switch (face) {
				case 'Down':
					targetLocation.y -= 1;
					break;
				case 'Up':
					targetLocation.y += 1;
					break;
				case 'North':
					targetLocation.z -= 1;
					break;
				case 'South':
					targetLocation.z += 1;
					break;
				case 'West':
					targetLocation.x -= 1;
					break;
				case 'East':
					targetLocation.x += 1;
					break;
			}

			player.dimension.playSound('mob.endermen.portal', player.location);
			player.dimension.playSound('mob.endermen.portal', targetLocation);

			player.teleport(targetLocation, { dimension: block.dimension });

			state.setCooldown('teleportation_cooldown', currentTick, 100);
			state.setFlag('teleportation_expiry', currentTick + 100);
		});
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

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
			player.playSound('note.pling', { volume: 0.1, pitch: 1.5 });
		} else if (totalPearlCount > 1 && customPearlSlot !== -1) {
			const customPearl = inventoryComp.container.getItem(customPearlSlot);
			if (customPearl) {
				customPearl.amount = 1;
				inventoryComp.container.setItem(customPearlSlot, customPearl);
			}
		}
	}
}
