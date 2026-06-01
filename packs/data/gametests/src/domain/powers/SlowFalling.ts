import { EntityEffectOptions, Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

/**
 * Slow falling power. Grants a gliding ability from one place to another.
 * The gliding effect is applied via the data-driven event suffix when the
 * player is in the air. Loose: dispatched to whoever is granted the power.
 */
@RegisterPower
export class SlowFalling implements Power {
	readonly id = 'slow_falling';
	readonly tickInterval = 1;

	onTick(player: Player): void {
		const velocity = player.getVelocity();

		if (velocity.y < -0.01 && !player.isSneaking) {
			const effectOptions: EntityEffectOptions = {
				amplifier: 0,
				showParticles: false
			};

			player.addEffect('slow_falling', 20, effectOptions);
		}
	}
}
