import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';

/** Kitsune origin grants the ability to utilize their inner spiritual abilities. */

@RegisterOrigin
export class Kitsune implements Origin {
	readonly id = 'kitsune';
	readonly powers: readonly string[] = [
		'camouflage',
		'fast_footed',
		'pounced',
		'berry_craver',
		'smaller_heart',
		'fast_metabolism',
		'strong_ankles'
	];
	readonly controls: readonly string[] = ['pounced-hold'];
}
