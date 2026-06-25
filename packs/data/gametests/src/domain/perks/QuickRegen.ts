import { Player, EntityHurtAfterEvent, system } from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

const STILL_THRESHOLD_TICKS = 60; // 3seconds
const REGEN_AMPLIFIER = 2; // regen 3
const REGEN_DURATION = 100; //5secs

const lastHitTick = new Map<string, number>();

@RegisterPerk
export class QuickRegen implements Perk {
	readonly id = 'quick_regen';
	readonly tickInterval = 10;

	onAcquire(player: Player): void {
		lastHitTick.set(player.id, -STILL_THRESHOLD_TICKS);
	}

	onRelease(player: Player): void {
		lastHitTick.delete(player.id);
		player.removeEffect(MinecraftEffectTypes.Regeneration);
	}

	onHurt(player: Player, ev: EntityHurtAfterEvent): void {
		const currentTick = system.currentTick;
		if (lastHitTick.get(player.id) === currentTick) return; 
		lastHitTick.set(player.id, currentTick);

		player.removeEffect(MinecraftEffectTypes.Regeneration);
	}

	onTick(player: Player): void {
		const lastHit = lastHitTick.get(player.id) ?? 0;
		const ticksSinceHit = system.currentTick - lastHit;

		if (ticksSinceHit >= STILL_THRESHOLD_TICKS) {
			player.addEffect(MinecraftEffectTypes.Regeneration, REGEN_DURATION, {
				amplifier: REGEN_AMPLIFIER,
				showParticles: true
			});
		}
	}
}
