import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Grants extra saturation when the owner finishes consuming any food item.
 * Hooks {@link Perk.onItemCompleteUse}.
 *
 * Implementation deferred.
 */
@RegisterPerk
export class MoreSaturatedFood implements Perk {
	readonly id = 'more_saturated_food';
}
