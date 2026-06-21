import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

@RegisterPower
export class SmallerHeart implements Power {
	readonly id = 'smaller_heart';
	readonly attributes: AttributeOverrides = {
		health: 12,
	}
}
