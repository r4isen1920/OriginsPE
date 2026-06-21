import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/**
 * Reduced max-health attribute layer for fragile origins (Arachnid).
 * Lower health is applied via the data-driven attribute event suffix.
 */
@RegisterPower
export class Fragile implements Power {
	readonly id = 'fragile';
	readonly attributes: AttributeOverrides	 = {
		health: 14,
	}
}
