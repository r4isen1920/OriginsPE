import { AttributeOverrides } from '../../services/Attributes';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

/**
 * Nine lives attribute layer for the feline power.
 */

@RegisterPower
export class NineLives implements Power {
	readonly id = 'nine_lives';
	readonly attributes: AttributeOverrides = {
		health: 18,
	}
}
