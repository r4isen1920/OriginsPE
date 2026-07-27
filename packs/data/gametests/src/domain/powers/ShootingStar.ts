import { EntityComponentTypes, Player, system } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { Entities } from '../../Files';
import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { ResourceBarService } from '../../services';


//#region Constants
const COOLDOWN_KEY = 'shooting_star_cooldown';
const STRESS_KEY = 'r4isen1920_originspe:stress';



/** Display-only stub for the `shooting_star` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class ShootingStar implements Power {
	readonly id = 'shooting_star';
	readonly icon = '11';

    readonly active = {
        icon: '11',
        name: 'origins.trait.shooting_star.name',
    };

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		if (state.isOnCooldown(COOLDOWN_KEY, now)) {
			player.playSound('note.bass', { volume: 1, pitch: 1.5 });
			return;
		}

		const ent = player.dimension.spawnEntity(
			Entities.ShootingStar,
			Vec3.from(player.location).up().up()
		);

		const proj = ent.getComponent(EntityComponentTypes.Projectile);
		if (!proj) return;

		proj.owner = player;
		proj.shoot(player.getViewDirection(), {
			uncertainty: 0.0
		});

        const currentStress = state.getFlag<number>(STRESS_KEY) ?? 0;
        const cooldownSeconds = currentStress > 70 ? 3 : 6;
        const cooldownTicks = cooldownSeconds * 20;

		state.setCooldown(COOLDOWN_KEY, now, cooldownTicks);

		ResourceBarService.push(player, {
			id: 11,
			durationSeconds: cooldownSeconds,
		});
	}

}
