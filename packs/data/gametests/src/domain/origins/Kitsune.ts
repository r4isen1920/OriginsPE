import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';

/** Kitsune origin grants the ability to utilize their inner spiritual abilities. */

@RegisterOrigin
export class Kitsune implements Origin {
	readonly id = 'kitsune';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'camouflage',
		'fast_footed',
		'pounce',
		'berry_craver',
		'smaller_heart',
		'fast_metabolism',
		'fall_immunity',
	];
	readonly controls: readonly string[] = ['pounced-hold'];
}
