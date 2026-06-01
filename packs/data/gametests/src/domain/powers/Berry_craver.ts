import { Player, TicksPerSecond, ItemStack, ItemCompleteUseAfterEvent } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class Berry_craver implements Power {
	readonly id = 'berry_craver';

	readonly tickInterval = 2;

	onTick(player: Player): void {
		try {
			const block = player.dimension.getBlock(player.location);
			const blockAbove = player.dimension.getBlock({
				x: player.location.x,
				y: player.location.y + 1,
				z: player.location.z
			});

			if (
				block?.typeId === 'minecraft:sweet_berry_bush' ||
				blockAbove?.typeId === 'minecraft:sweet_berry_bush'
			) {
				const healthComp = player.getComponent('health');
				if (
					healthComp &&
					(healthComp as any).currentValue < (healthComp as any).defaultValue
				) {
					player.runCommand(`effect @s instant_health 1 0 true`);
				}
			}

			const inventory = player.getComponent('inventory');
			if (!inventory?.container) return;

			for (let i = 0; i < inventory.container.size; i++) {
				const item = inventory.container.getItem(i);
				if (item && item.typeId === 'minecraft:sweet_berries') {
					inventory.container.setItem(
						i,
						new ItemStack('r4isen1920_originspe:kitsune_sweet_berries', item.amount)
					);
				}
			}
		} catch {}
	}

	onItemCompleteUse(player: Player, ev: ItemCompleteUseAfterEvent): void {
		try {
			const { itemStack } = ev;
			if (!itemStack.typeId.includes('sweet_berries')) return;

			player.addEffect('minecraft:regeneration', TicksPerSecond * 4, {
				amplifier: 1
			});

			if (Math.random() < 0.35) {
				player.addEffect('minecraft:regeneration', TicksPerSecond * 12, {
					amplifier: 2
				});
			}
		} catch {}
	}
}
