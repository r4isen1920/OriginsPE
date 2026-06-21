import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


@RegisterPower
export class VineBindPower implements Power {
	readonly id = 'vine_bind_power';
}
