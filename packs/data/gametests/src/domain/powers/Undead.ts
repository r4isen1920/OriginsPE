import {
	EntityDamageCause,
	EntityHurtBeforeEvent,
	EffectAddAfterEvent,
	EntityHurtAfterEvent,
	EntityHealthComponent,
	Player,
	system
} from '@minecraft/server';
import { AfterEntityHurt } from '../../core/platform/DecoratedEvents';
import { AttributeOverrides } from '../../services/Attributes';
import { AttributeService } from '../../services/AttributeService';
import { BeforeEntityHurt } from '../../core';
import { PlayerState } from '../../core/platform/PlayerState';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

/**
 * Their undead condition makes them immune to poison and freezing damage, but weak to fire, and sunlight.
 * Health and harming potions have opposite effects.
 * They also don't have to breath underwater to survive.
 */

@RegisterPower
export class Undead implements Power {
	readonly id = 'undead';
	readonly attributes: AttributeOverrides = {
		//familyType: 'undead',
		breathable: 'amphibious',
		damageOverrides: [
			{
				cause: EntityDamageCause.freezing,
				multiplier: 0,
				id: 'freezing'
			},
			{
				cause: EntityDamageCause.fire,
				multiplier: 2,
				id: 'fire'
			}
		]
	};
	readonly tickInterval = 3;

	//poison and sunlight
	onTick(player: Player): void {
		const hasPoison = player.getEffect('poison');
		if (hasPoison) {
			player.removeEffect('poison');
		}
		const loc = player.location;

		let hasCeiling = false;
		for (let dy = 1; dy <= 10; dy++) {
			const above = player.dimension.getBlock({
				x: Math.floor(loc.x),
				y: Math.floor(loc.y) + dy,
				z: Math.floor(loc.z)
			});
			if (above && !above.isAir) {
				hasCeiling = true;
				break;
			}
		}

		let isDay = false;

		const result = player.runCommand('time query daytime');
		const ticks = parseInt((result as any).statusMessage?.match(/\d+/)?.[0] ?? '0');
		isDay = ticks >= 0 && ticks <= 12000;

		const inDirectSunlight = !hasCeiling && isDay && loc.y > 60;

		if (inDirectSunlight) {
			AttributeService.apply(player, { burnsInDaylight: true });
		} else {
			AttributeService.apply(player, { burnsInDaylight: false });
		}
	}
}
