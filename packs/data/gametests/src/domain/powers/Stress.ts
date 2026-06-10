import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `stress` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Stress implements Power {
	readonly id = 'stress';
	readonly icon = '09';
}
