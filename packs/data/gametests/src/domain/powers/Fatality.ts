import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { world, Player } from '@minecraft/server';
import { PlayerTick } from '../../core/Ticker';
import { Logger as BoostLogger } from '@bedrock-oss/bedrock-boost';
import { PlayerState } from '../../core/PlayerState';

/**
 * Fatality: Causes the player to deal massive damage when attacking enemies.
 */
@RegisterPower
export class Fatality implements Power {
	readonly id = 'fatality';

	private static readonly log = BoostLogger.getLogger('OriginsPE', 'Fatality');

	constructor() {
		Fatality.registerDamageListener();
		Fatality.log.info('Fatality power instance created and listener verified.');
	}

	@PlayerTick(1)
	static onPlayerTick(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'bee') return;

		const target = player.getEntitiesFromViewDirection({ maxDistance: 4 })[0]?.entity;

		if (target) {
			const fatalPoison = target.getEffect('fatal_poison');
			if (fatalPoison) {
				player.onScreenDisplay.setActionBar('§6Target Vulnerable: Fatality§r');
			}
		}
	}

	private static registerDamageListener(): void {
		world.afterEvents.entityHurt.subscribe((ev) => {
			const attacker = ev.damageSource.damagingEntity;
			const target = ev.hurtEntity;

			if (attacker instanceof Player) {
				const state = PlayerState.for(attacker);
				if (state.getOrigin() !== 'bee') return;

				const effect = target.getEffect('fatal_poison');
				if (effect) {
					const bonus = ev.damage * 0.5;
					target.applyDamage(bonus, {
						cause: ev.damageSource.cause,
						damagingEntity: attacker
					});

					attacker.onScreenDisplay.setActionBar('§6FATALITY: +50% Damage§r');
					attacker.playSound('random.orb');
					this.log.info(`Applied fatality damage to ${target.typeId}`);
				}
			}
		});
	}
}
