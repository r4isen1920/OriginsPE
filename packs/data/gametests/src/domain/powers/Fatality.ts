import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { Player, EntityHurtAfterEvent } from '@minecraft/server';
import { Logger as BoostLogger } from '@bedrock-oss/bedrock-boost';

/**
 * Fatality: the holder deals 50% bonus damage to targets afflicted with fatal poison.
 */
@RegisterPower
export class Fatality implements Power {
	readonly id = 'fatality';
	readonly tickInterval = 1;

	private static readonly log = BoostLogger.getLogger('OriginsPE', 'Fatality');

	onTick(player: Player): void {
		const target = player.getEntitiesFromViewDirection({ maxDistance: 4 })[0]?.entity;

		if (target) {
			const fatalPoison = target.getEffect('fatal_poison');
			if (fatalPoison) {
				player.onScreenDisplay.setActionBar('§6Target Vulnerable: Fatality§r');
			}
		}
	}

	onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
		const target = ev.hurtEntity;

		const effect = target.getEffect('fatal_poison');
		if (effect) {
			const bonus = ev.damage * 0.5;
			target.applyDamage(bonus, {
				cause: ev.damageSource.cause,
				damagingEntity: player
			});

			player.onScreenDisplay.setActionBar('§6FATALITY: +50% Damage§r');
			player.playSound('random.orb');
		}
	}
}
