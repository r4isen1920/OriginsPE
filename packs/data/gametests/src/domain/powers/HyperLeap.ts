import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `hyper_leap` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class HyperLeap implements Power {
	readonly id = 'hyper_leap';
	readonly icon = '21';
}
