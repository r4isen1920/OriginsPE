import { Player, TicksPerSecond, ItemCompleteUseAfterEvent } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterItemCompleteUse } from '../../core/platform/DecoratedEvents';

const FAKE_SUGAR = 'r4isen1920_originspe:fake_sugar';

const SAT_DURATION_TICKS = TicksPerSecond * 30;
const SAT_AMPLIFIER = 1;

/**
 * Small Appetite: consuming sugar grants long-lasting saturation,
 * so the player needs less food to keep going.
 */
@RegisterPower
export class SmallApetite implements Power {
	readonly id = 'small_apetite';

	@AfterItemCompleteUse
	static onItemCompleteUse(ev: ItemCompleteUseAfterEvent): void {
		const { itemStack, source: player } = ev;
		if (itemStack.typeId !== FAKE_SUGAR) return;
		if (!(player instanceof Player)) return;

		const state = PlayerState.for(player);
		if (!state?.hasPower('small_apetite')) return;

		player.addEffect('minecraft:saturation', SAT_DURATION_TICKS, {
			amplifier: SAT_AMPLIFIER,
			showParticles: false
		});
	}
}
