import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** avian feather origin can be seen gliding from one place to another. */
@RegisterOrigin
export class Avian implements Origin {
	readonly id = 'avian';
	readonly difficulty = OriginDifficulty.Easy;
	readonly powers: readonly string[] = [
		'tailwind',
		'slow_falling',
		'vegetarian',
		'fresh_air',
	];
}
