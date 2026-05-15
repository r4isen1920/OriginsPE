import { EntityEffectOptions, Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';

/**
 * Slow falling power for avian origins. Grants a gliding ability from one place to another.
 * The gliding effect is applied via the data-driven event suffix when the player is in the air.
 */
@RegisterPower
export class Slow_falling implements Power {
	readonly id = 'slow_falling';

	@PlayerTick(1)
	static onTick(player: Player) {
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'avian') return;

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
