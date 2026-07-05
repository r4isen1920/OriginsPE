import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeOverrides } from '../../services';

@RegisterPower
export class CatlikeAppearance implements Power {
	readonly id = 'scare_creepers';
	readonly tickInterval = 3;

	readonly attributes: AttributeOverrides = {
		familyType: 'cat'
	}
}
