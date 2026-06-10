import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `vine_bind` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class VineBind implements Power {
	readonly id = 'vine_bind';
	readonly icon = '24';
}
