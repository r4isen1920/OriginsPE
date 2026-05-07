import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Boosts the amplifier of effects produced by splash and lingering potions
 * thrown by the owner.
 *
 * Implementation deferred.
 */
@RegisterPerk
export class PowerfulPotions implements Perk {
	readonly id = 'powerful_potions';
}
