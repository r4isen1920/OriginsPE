import { Player, EntityComponentTypes, system } from '@minecraft/server';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { Bloodthirsty } from './Bloodthirsty';
import { EntityUtils } from '../../utils/EntityUtils';

@RegisterPower
export class Regenerative implements Power {
	readonly id = 'regenerative';
	readonly tickInterval = 20; // 1s

	private static readonly REGEN_AMPLIFIER = 2;
	private static readonly REGEN_DURATION_TICKS = 100;

	private static readonly DRAIN_KEY = 'regenerative_extra_drain';
	private static readonly DRAIN_INTERVAL_TICKS = 100; // 5s
	private static readonly DRAIN_AMOUNT = 1;

	onAcquire(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<number>(Regenerative.DRAIN_KEY) === undefined) {
			state.setFlag(Regenerative.DRAIN_KEY, system.currentTick);
		}
	}

	onRelease(player: Player): void {
		player.removeEffect(MinecraftEffectTypes.Regeneration);
	}

	onTick(player: Player): void {
		const health = EntityUtils.getComponent(player, EntityComponentTypes.Health);
		if (health && health.currentValue >= health.effectiveMax) {
			player.removeEffect(MinecraftEffectTypes.Regeneration);
			return;
		}

		const isBurning = EntityUtils.getComponent(player, EntityComponentTypes.OnFire) !== undefined;
		const blood = Bloodthirsty.getBlood(player);

		if (isBurning || blood <= 0) {
			player.removeEffect(MinecraftEffectTypes.Regeneration);
		} else {
			player.addEffect(MinecraftEffectTypes.Regeneration, Regenerative.REGEN_DURATION_TICKS, {
				amplifier: Regenerative.REGEN_AMPLIFIER,
				showParticles: false
			});
		}

		this.tickThirst(player);
	}

	private tickThirst(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		let lastDrainTick = state.getFlag<number>(Regenerative.DRAIN_KEY);
		if (lastDrainTick === undefined) {
			state.setFlag(Regenerative.DRAIN_KEY, now);
			return;
		}

		const elapsed = now - lastDrainTick;
		if (elapsed < Regenerative.DRAIN_INTERVAL_TICKS) return;

		const steps = Math.floor(elapsed / Regenerative.DRAIN_INTERVAL_TICKS);
		Bloodthirsty.drainBlood(player, steps * Regenerative.DRAIN_AMOUNT);
		state.setFlag(
			Regenerative.DRAIN_KEY,
			lastDrainTick + steps * Regenerative.DRAIN_INTERVAL_TICKS
		);
	}
}
