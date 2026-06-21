import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class Gills implements Power {
	readonly id = 'water_breathing';
	readonly attributes: AttributeOverrides = {
		breathable: 'underwater',
	};
}
