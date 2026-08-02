import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeOverrides } from '../../services';

/**
 * Swift: Players with this power have increased movement speed.
 */

@RegisterPower
export class Swift implements Power {
	readonly id = 'swift';

	readonly attributes: AttributeOverrides = {
		movement: 0.05,
	};
}
