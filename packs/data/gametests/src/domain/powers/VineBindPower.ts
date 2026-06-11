import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


@RegisterPower
export class VineBindPower implements Power {
	readonly id = 'vine_bind_power';
}
