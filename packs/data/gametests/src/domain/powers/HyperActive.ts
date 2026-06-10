import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `hyper_active` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class HyperActive implements Power {
	readonly id = 'hyper_active';
	readonly icon = '12';
}
