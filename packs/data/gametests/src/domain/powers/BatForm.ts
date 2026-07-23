import { EntityEffectOptions, Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

const FLAG_BAT_FORM = 'bat_form_active';
const PROP_BAT_FORM = 'r4isen1920_originspe:is_bat_form';

@RegisterPower
export class BatForm implements Power {
	readonly id = 'bat_form';
	readonly tickInterval = 1;

	readonly active = {
		icon: '32',
		name: 'origins.trait.bat_form.name'
	};

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		const isActive = state.getFlag<boolean>(FLAG_BAT_FORM) ?? false;
		const next = !isActive;

		state.setFlag(FLAG_BAT_FORM, next);
		player.setProperty(PROP_BAT_FORM, next);

		if (!next) {
			player.removeEffect('levitation');
		}
        player.dimension.playSound('origins.bat.transform', player.location, {
				volume: 1.0,
				pitch: 1.25
			});
		player.dimension.spawnParticle('r4isen1920_originspe:bat', {
			x: player.location.x,
			y: player.location.y + 1,
			z: player.location.z
		});
	}

	onRelease(player: Player): void {
		PlayerState.for(player).setFlag(FLAG_BAT_FORM, undefined);
		player.setProperty(PROP_BAT_FORM, false);
		player.removeEffect('levitation');
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		if (!(state.getFlag<boolean>(FLAG_BAT_FORM) ?? false)) return;

		if (player.isJumping) {
			const effectOptions: EntityEffectOptions = {
				amplifier: 3,
				showParticles: false
			};
			player.addEffect('levitation', 10, effectOptions);
		} else {
			player.removeEffect('levitation');
		}

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
