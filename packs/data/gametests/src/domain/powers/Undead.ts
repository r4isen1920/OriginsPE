import {
	EntityDamageCause,
	EntityHurtBeforeEvent,
	EffectAddAfterEvent,
	EntityHurtAfterEvent,
	EntityHealthComponent,
	Player,
	system,
	world,
	GameMode
} from '@minecraft/server';
import { AfterEntityHurt } from '../../core/platform/DecoratedEvents';
import { AttributeOverrides } from '../../services/Attributes';
import { AttributeService } from '../../services/AttributeService';
import { BeforeEntityHurt } from '../../core';
import { PlayerState } from '../../core/platform/PlayerState';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';
import { BatForm } from './BatForm';

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
			},
			{
				cause: EntityDamageCause.fire,
				multiplier: 2,
			},
			{
				cause: EntityDamageCause.fireTick,
				multiplier: 2,
			}
		]
	};
	readonly tickInterval = 3;

	//poison and sunlight
	onTick(player: Player): void {
		const immuneEffects = [
			MinecraftEffectTypes.Poison,
			MinecraftEffectTypes.FatalPoison,
			MinecraftEffectTypes.Wither,
		];
		for (const effect of immuneEffects) {
			if (player.getEffect(effect)) {
				player.removeEffect(effect);
			}
		}

		const loc = player.location;
		const hasCeiling = !!player.dimension.getBlockAbove(loc);
		const isDay = world.getTimeOfDay() >= 1000 && world.getTimeOfDay() <= 13000;
		const inDirectSunlight = !hasCeiling && isDay;

		if (
			!BatForm.isInBatForm(player) &&
			inDirectSunlight &&
			player.getGameMode() !== GameMode.Creative
		) {
			AttributeService.apply(player, { burnsInDaylight: true });
		} else {
			AttributeService.apply(player, { burnsInDaylight: false });
		}
	}
}
