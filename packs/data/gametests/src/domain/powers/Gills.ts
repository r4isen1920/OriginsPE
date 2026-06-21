import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

@RegisterPower
export class Gills implements Power {
	readonly id = 'water_breathing';
	readonly attributes: AttributeOverrides = {
		breathable: 'underwater',
	};
}
