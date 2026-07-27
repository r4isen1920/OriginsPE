import { EntityEffectOptions, Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services';


@RegisterPower
export class BatForm implements Power {
	readonly id = 'bat_form';
	readonly tickInterval = 1;

	readonly active = {
		icon: '34',
		name: 'origins.trait.bat_form.name'
	};

	onActivate(player: Player): void {
		const isActive = AttributeService.getApplied(player.id).modelType === 'bat';
		const next = !isActive;

		AttributeService.apply(player, {
			modelType: next ? 'bat' : 'normal',
		});

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
		AttributeService.apply(player, {
			modelType: 'normal',
		})
		player.removeEffect('levitation');
	}

	onTick(player: Player): void {
		const state = AttributeService.getApplied(player.id);
		if (state.modelType !== 'bat') return;

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
