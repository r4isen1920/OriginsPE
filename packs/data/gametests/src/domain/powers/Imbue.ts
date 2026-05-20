import { Player, world, EntityDamageCause } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class Imbue implements Power {
	readonly id = 'imbue';
	private static readonly log = Log.get('Imbue');

	private static readonly UNDEAD_TYPES = new Set([
		'minecraft:zombie',
		'minecraft:zombie_villager',
		'minecraft:husk',
		'minecraft:drowned',
		'minecraft:skeleton',
		'minecraft:stray',
		'minecraft:wither_skeleton',
		'minecraft:phantom',
		'minecraft:zoglin',
		'minecraft:zombified_piglin',
		'minecraft:wither',
		'minecraft:bogged'
	]);

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damageSource, hurtEntity } = event;

				const attacker = damageSource.damagingEntity;
				if (!(attacker instanceof Player)) return;

				const state = PlayerState.for(attacker);
				if (state.getOrigin() !== 'elf') return;

				if (
					damageSource.cause !== EntityDamageCause.projectile ||
					damageSource.damagingProjectile?.typeId !== 'minecraft:arrow'
				)
					return;

				const attackerHealthComp = attacker.getComponent('health');
				if (!attackerHealthComp) return;

				let additionalDamage = attackerHealthComp.currentValue * 0.5;

				const targetIsUndead = Imbue.UNDEAD_TYPES.has(hurtEntity.typeId);
				if (targetIsUndead) {
					const targetHealthComp = hurtEntity.getComponent('health');
					const targetMax = targetHealthComp ? targetHealthComp.effectiveMax : 20;
					additionalDamage += targetMax * 0.25;
				}

				const roundedDamage = Math.round(additionalDamage);
				if (roundedDamage <= 0) return;

				hurtEntity.applyDamage(roundedDamage, {
					cause: EntityDamageCause.magic,
					damagingEntity: attacker
				});

				try {
					const viewDirection = attacker.getViewDirection();
					const chargeParticleLocation = {
						x: attacker.location.x + viewDirection.x * 1.25,
						y: attacker.location.y + 1 + viewDirection.y * 1.25,
						z: attacker.location.z + viewDirection.z * 1.25
					};

					attacker.dimension.spawnParticle(
						'r4isen1920_originspe:elven_bow_charge',
						chargeParticleLocation
					);
					hurtEntity.dimension.spawnParticle('r4isen1920_originspe:elven_bow_impact', {
						x: hurtEntity.location.x,
						y: hurtEntity.location.y + 1,
						z: hurtEntity.location.z
					});

					attacker.dimension.playSound('ender_eye.dead', hurtEntity.location);
					attacker.dimension.playSound('ender_eye.dead', attacker.location);
				} catch {}
			} catch (error: any) {
				Imbue.log.error(
					`Error inside Imbue projectile damage handler: ${error?.stack ?? error}`
				);
			}
		});
	}
}
