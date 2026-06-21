import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class SmallerHeart implements Power {
	readonly id = 'smaller_heart';
	readonly attributes: AttributeOverrides = {
		health: 12,
	}
}
