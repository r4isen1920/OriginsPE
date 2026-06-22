import { Player, ItemStack, world, system, ItemCompleteUseAfterEvent } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { OnWorldLoad } from '@bedrock-oss/stylish';
import { AfterItemCompleteUse } from '../../core/platform/DecoratedEvents';
import { ResourceBarService } from '../../services';

const VANILLA_SUGAR = 'minecraft:sugar';
const FAKE_SUGAR = 'r4isen1920_originspe:fake_sugar';

const SPEED_DURATION_TICKS = 100; // 5 seconds
const SPEED_AMPLIFIER = 0; // Speed I
@RegisterPower
export class HyperActive implements Power {
	readonly id = 'hyper_active';
	readonly icon = '12';

	readonly tickInterval = 3;
	

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state.hasPower('hyper_active')) return;

		const inventory = player.getComponent('minecraft:inventory');
		if (!inventory?.container) return;
		const container = inventory.container;

		const selectedSlot = player.selectedSlotIndex;
		const selectedItem = container.getItem(selectedSlot);
		const isEating = selectedItem?.typeId === FAKE_SUGAR;

		for (let slot = 0; slot < container.size; slot++) {
			if (isEating && slot === selectedSlot) continue;

			const item = container.getItem(slot);
			if (item?.typeId === VANILLA_SUGAR) {
				container.setItem(slot, new ItemStack(FAKE_SUGAR, item.amount));
			}
		}
	}

	@AfterItemCompleteUse
	static onItemCompleteUse(event: ItemCompleteUseAfterEvent): void {
		const { itemStack, source: player } = event;
		if (itemStack.typeId !== FAKE_SUGAR) return;
		if (!(player instanceof Player)) return;

		const state = PlayerState.for(player);
		if (!state?.hasPower('hyper_active')) return;

		player.addEffect('minecraft:speed', SPEED_DURATION_TICKS, {
			amplifier: SPEED_AMPLIFIER,
			showParticles: true
		});

		ResourceBarService.push(player, {
				id: 12,
				durationSeconds: 5,
			});
	}

	@OnWorldLoad
	static onWorldLoad(): void {
		system.runInterval(() => {
			for (const player of world.getAllPlayers()) {
				if (!player.isValid) continue;

				const state = PlayerState.for(player);
				if (state?.hasPower('hyper_active')) continue;

				const inventory = player.getComponent('minecraft:inventory');
				if (!inventory?.container) continue;
				const container = inventory.container;

				for (let slot = 0; slot < container.size; slot++) {
					const item = container.getItem(slot);
					if (item?.typeId === FAKE_SUGAR) {
						container.setItem(slot, new ItemStack(VANILLA_SUGAR, item.amount));
					}
				}
			}
		}, 20);
	}
}
