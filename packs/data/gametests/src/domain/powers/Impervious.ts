import {
	Player,
	EntityDamageCause,
	EntityHurtBeforeEvent,
	TicksPerSecond
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
/**
 * Impervious: Makes the holder immune to fire and lava damage, gaining strength instead.
 */
@RegisterPower
export class Impervious implements Power {
	readonly id = 'fire_immunity';
	readonly tickInterval = 1;

	private static pendingEffects = new Set<string>();

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		if (!player.isValid) return;

		if (
			ev.damageSource.cause === EntityDamageCause.fire ||
			ev.damageSource.cause === EntityDamageCause.lava ||
			ev.damageSource.cause === EntityDamageCause.fireTick ||
			ev.damageSource.cause === EntityDamageCause.magma
		) {
			ev.cancel = true;
		}
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

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
	}
}
