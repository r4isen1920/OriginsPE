import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Elven origin grants the ability to weave life. */
@RegisterOrigin
export class Elven implements Origin {
	readonly id = 'elven';
	readonly powers: readonly string[] = [
		'lifeweaver',
		'endless_quiver',
		'imbue',
		'swift',
		'permeable',
	];
}
