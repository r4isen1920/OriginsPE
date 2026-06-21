import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `meditate` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Meditate implements Power {
	readonly id = 'meditate';
	readonly icon = '09';
}
