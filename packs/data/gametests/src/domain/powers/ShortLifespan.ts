import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/**
 * Reduced max-health attribute layer for Short_lifespan origins (Bee).
 * Lower health is applied via the data-driven attribute event suffix.
 */
@RegisterPower
export class ShortLifespan implements Power {
	readonly id = 'lifespan';
	readonly attributes: AttributeOverrides = {
		health: 14,
	}
}
