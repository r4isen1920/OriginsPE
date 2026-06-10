import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Starborne origin grants the ability to hyperleap. */
@RegisterOrigin
export class Starborne implements Origin {
	readonly id = 'starborne';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'stress',
		'meditate',
		'cosmic_gift',
		'hyper_leap',
		'shooting_star',
		'no_hitting',
		'burning',
	];
}
