import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';

@RegisterPower
export class Acrobatics implements Power {
	readonly id = 'acrobatics';

	@PlayerTick(2)
	static onPlayerTick(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'feline') return;

		if (player.isSprinting) {
			player.addEffect('jump_boost', 30, {
				amplifier: 1,
				showParticles: false
			});
		} else {
			const currentEffect = player.getEffect('jump_boost');
			if (currentEffect && currentEffect.amplifier === 1) {
				player.removeEffect('jump_boost');
			}
		}
	}
}
