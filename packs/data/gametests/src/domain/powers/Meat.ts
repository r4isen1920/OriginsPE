import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


@RegisterPower
export class Meat implements Power {
	readonly id = 'i_want_meat';
}
