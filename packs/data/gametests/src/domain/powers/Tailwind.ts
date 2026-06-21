import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

/**
 * Tail wind power for avian origins. Grants a speed boost when sprinting.
 * The speed boost is applied via the data-driven attribute event suffix.
 */
@RegisterPower
export class Tailwind implements Power {
	readonly id = 'tailwind';
	readonly attributes: AttributeOverrides = {
		movement: 0.15,
	}
}
