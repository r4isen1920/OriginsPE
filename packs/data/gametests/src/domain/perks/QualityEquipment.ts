import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Improves the owner's odds of finding higher-tier tools and armor in
 * generated loot. Hooks loot-table or container-open events.
 *
 * Implementation deferred.
 */
@RegisterPerk
export class QualityEquipment implements Perk {
	readonly id = 'quality_equipment';
}
