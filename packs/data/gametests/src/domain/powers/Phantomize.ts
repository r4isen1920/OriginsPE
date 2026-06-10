import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `phantomize` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Phantomize implements Power {
	readonly id = 'phantomize';
	readonly icon = '05';
}
