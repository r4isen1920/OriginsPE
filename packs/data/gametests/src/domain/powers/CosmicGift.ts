import { EntityDamageCause, Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { AttributeOverrides } from '../../services';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

@RegisterPower
export class CosmicGift implements Power {
	readonly id = 'cosmic_gift';
	readonly tickInterval = 2;

	readonly attributes: AttributeOverrides = {
		damageOverrides: [
			{
				cause: EntityDamageCause.fall,
				multiplier: 0.0
			}
		]
	};

	onTick(player: Player): void {
		const effectsToApply = [
			MinecraftEffectTypes.SlowFalling,
			MinecraftEffectTypes.JumpBoost,
		];

		for (const effect of effectsToApply) {
			if (effect === MinecraftEffectTypes.SlowFalling && player.isOnGround) continue;

			player.addEffect(effect, TicksPerSecond, {
				amplifier: effect === MinecraftEffectTypes.JumpBoost ? 2 : 0,
				showParticles: false,
			});
		}
		
	}

}
