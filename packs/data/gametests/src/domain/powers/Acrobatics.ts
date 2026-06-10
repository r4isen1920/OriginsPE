import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Sprint-jump passive. Grants jump boost while sprinting so the owner can
 * leap higher. Dispatched centrally to whoever has the power granted, so it
 * carries no origin coupling and can be attached to any origin.
 */
@RegisterPower
export class Acrobatics implements Power {
	readonly id = 'sprint_jump';
	readonly tickInterval = 2;

	onTick(player: Player): void {
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
