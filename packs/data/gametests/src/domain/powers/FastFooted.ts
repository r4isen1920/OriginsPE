import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeOverrides } from '../../services';

@RegisterPower
export class FastFooted implements Power {
	readonly id = 'fast_footed';

	readonly attributes: AttributeOverrides = {
		movement: 0.0425,
		scale: -0.25,
	};
}
