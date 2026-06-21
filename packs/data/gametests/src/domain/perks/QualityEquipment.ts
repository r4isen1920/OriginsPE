import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';


/**
 * Improves the owner's odds of finding higher-tier tools and armor in
 * generated loot. Hooks loot-table or container-open events.
 *
 * Implementation deferred.
 */
@RegisterPerk
export class QualityEquipment implements Perk {
	readonly id = 'efficient_repairs';
}
