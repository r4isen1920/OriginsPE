import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


@RegisterPower
export class SmallApetite implements Power {
	readonly id = 'small_apetite';
}
