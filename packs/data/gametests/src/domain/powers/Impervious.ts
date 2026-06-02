import {
	Player,
	EntityDamageCause,
	EntityHurtBeforeEvent,
	TicksPerSecond
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { Log } from '../../utils/Log';
/**
 * Impervious: Makes the holder immune to fire and lava damage, gaining strength instead.
 */
@RegisterPower
export class Impervious implements Power {
	readonly id = 'impervious';
	readonly tickInterval = 1;

	private static readonly log = Log.get('Impervious');
	private static pendingEffects = new Set<string>();
	private static shouldMaximizeHealth = new Set<string>();

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		try {
			if (!player.isValid) return;

			if (
				ev.damageSource.cause === EntityDamageCause.fire ||
				ev.damageSource.cause === EntityDamageCause.lava ||
				ev.damageSource.cause === EntityDamageCause.fireTick ||
				ev.damageSource.cause === EntityDamageCause.magma
			) {
				Impervious.shouldMaximizeHealth.add(player.id);
				Impervious.pendingEffects.add(player.id);
			}
		} catch (error: any) {
			Impervious.log.error(
				`[${player.name ?? 'Unknown Player'}] Error inside onHurtBefore loop: ${error?.stack ?? error}`
			);
		}
	}

	onTick(player: Player): void {
		try {
			if (!player.isValid) return;

			if (Impervious.shouldMaximizeHealth.has(player.id)) {
				const healthComponent = player.getComponent('minecraft:health');
				if (healthComponent) {
					const maxHealth = healthComponent.effectiveMax;
					healthComponent.setCurrentValue(maxHealth);
				}
				Impervious.shouldMaximizeHealth.delete(player.id);
			}

			const isBurning = player.getComponent('minecraft:onfire');
			if (isBurning) {
				player.addEffect('fire_resistance', TicksPerSecond * 2, {
					showParticles: false
				});
				Impervious.pendingEffects.add(player.id);
			}

			if (!Impervious.pendingEffects.has(player.id)) return;
			Impervious.pendingEffects.delete(player.id);

			player.addEffect('strength', TicksPerSecond * 12, { amplifier: 1 });
			player.dimension.spawnParticle('r4isen1920_originspe:blaze_aura', player.location);
		} catch (error: any) {
			Impervious.log.error(
				`[${player.name ?? 'Unknown Player'}] Error inside Impervious ticker handler: ${error?.stack ?? error}`
			);
		}
	}
}
