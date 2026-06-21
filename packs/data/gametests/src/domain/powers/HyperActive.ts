import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/** Display-only stub for the `hyper_active` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class HyperActive implements Power {
	readonly id = 'hyper_active';
	readonly icon = '12';
}
