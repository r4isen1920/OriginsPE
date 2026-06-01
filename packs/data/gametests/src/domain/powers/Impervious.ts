import {
	Player,
	EntityDamageCause,
	EntityHurtBeforeEvent,
	TicksPerSecond
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';

/**
 * Impervious: Makes the holder immune to fire and lava damage, gaining strength instead.
 */

@RegisterPower
export class Impervious implements Power {
	readonly id = 'impervious';

	private static pendingEffects = new Set<string>();

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		if (
			ev.damageSource.cause === EntityDamageCause.fire ||
			ev.damageSource.cause === EntityDamageCause.lava ||
			ev.damageSource.cause === EntityDamageCause.fireTick ||
			ev.damageSource.cause === EntityDamageCause.magma
		) {
			ev.damage = 0;
			Impervious.pendingEffects.add(player.id);
		}
	}

	@PlayerTick(1)
	static onTick(player: Player): void {
		try {
			const isBurning = player.getComponent('minecraft:onfire');
			if (isBurning) {
				player.addEffect('fire_resistance', TicksPerSecond * 2, {
					showParticles: false
				});
				this.pendingEffects.add(player.id);
			}

			if (!this.pendingEffects.has(player.id)) return;
			this.pendingEffects.delete(player.id);

			player.addEffect('strength', TicksPerSecond * 12, { amplifier: 1 });
			player.dimension.spawnParticle('r4isen1920_originspe:blaze_aura', player.location);
		} catch {}
	}
}
