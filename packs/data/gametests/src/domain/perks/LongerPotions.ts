import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';


/**
 * Extends the duration of any potion the owner consumes by a flat multiplier.
 * Hooks {@link Perk.onItemCompleteUse} to detect potion drinks and re-apply
 * the resulting effects with a longer duration.
 *
 * Implementation deferred.
 */
@RegisterPerk
export class LongerPotions implements Perk {
	readonly id = 'longer_potions';
}
