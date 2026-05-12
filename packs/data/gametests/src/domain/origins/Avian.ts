import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** avian feather origin can be seen gliding from one place to another. */
@RegisterOrigin
export class Avian implements Origin {
	readonly id = 'avian';
	readonly powers: readonly string[] = [
		'tail_wind',
		'slow_falling',
		'vegetarian',
		'fresh_air',
	];
}
