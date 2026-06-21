import { Player, ItemStack, world, system, ItemCompleteUseAfterEvent } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { OnWorldLoad } from '@bedrock-oss/stylish';
import { AfterItemCompleteUse } from '../../core/platform/DecoratedEvents';

@RegisterPower
export class SlimeBallConsume implements Power {
	readonly id = 'slime_ball_consume';
	readonly tickInterval = 3;

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state.hasPower('slime_ball_consume')) return;

		const inventory = player.getComponent('minecraft:inventory');
		if (!inventory || !inventory.container) return;

		const container = inventory.container;

		const selectedSlot = player.selectedSlotIndex;
		const selectedItem = container.getItem(selectedSlot);
		const isEating = selectedItem?.typeId === 'r4isen1920_originspe:fake_slimeball';

		for (let slot = 0; slot < container.size; slot++) {
			if (isEating && slot === selectedSlot) continue;

			const item = container.getItem(slot);
			if (item?.typeId === 'minecraft:slime_ball') {
				container.setItem(
					slot,
					new ItemStack('r4isen1920_originspe:fake_slimeball', item.amount)
				);
			}
		}
	}

	@AfterItemCompleteUse
	static onItemCompleteUse(event: ItemCompleteUseAfterEvent): void {
		const { itemStack, source: player } = event;
		if (itemStack.typeId !== 'r4isen1920_originspe:fake_slimeball') return;
		if (!(player instanceof Player)) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('slime_ball_consume')) return;

		const currentLevel = state.getFlag<number>('fragmentation_level') ?? 3;

		switch (currentLevel) {
			case 3:
				player.addEffect('minecraft:regeneration', 240, { amplifier: 0 });
				break;

			case 2:
				state.setFlag('previous_fragmentation_level', 2);
				state.setFlag('fragmentation_level', 3);
				player.addEffect('minecraft:regeneration', 60, { amplifier: 255 });
				break;

			case 1:
				state.setFlag('previous_fragmentation_level', 1);
				state.setFlag('fragmentation_level', 2);
				player.addEffect('minecraft:regeneration', 60, { amplifier: 255 });
				break;
		}
	}

	@OnWorldLoad
	static onWorldLoad(): void {
		system.runInterval(() => {
			for (const player of world.getAllPlayers()) {
				if (!player.isValid) continue;

				const state = PlayerState.for(player);
				if (!state || !state.hasPower('slime_ball_consume')) {
					const inventory = player.getComponent('minecraft:inventory');
					if (!inventory || !inventory.container) continue;

					const container = inventory.container;
					for (let slot = 0; slot < container.size; slot++) {
						const item = container.getItem(slot);
						if (item?.typeId === 'r4isen1920_originspe:fake_slimeball') {
							container.setItem(
								slot,
								new ItemStack('minecraft:slime_ball', item.amount)
							);
						}
					}
				}
			}
		}, 20);
	}
}
