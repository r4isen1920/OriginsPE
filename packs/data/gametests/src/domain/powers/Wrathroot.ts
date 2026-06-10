import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `wrathroot` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Wrathroot implements Power {
	readonly id = 'wrathroot';
	readonly icon = '25';
}
