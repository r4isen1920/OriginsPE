import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { AttributeOverrides } from '../../services';

@RegisterPower
export class BiteSized implements Power {
	readonly id = 'bite_sized';

	readonly attributes: AttributeOverrides = {
		health: 10,
		scale: 0.25,
	};
}
