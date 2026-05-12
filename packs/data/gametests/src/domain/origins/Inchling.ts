import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Inchling origin these creatures are as nimble as their size. */
@RegisterOrigin
export class Inchling implements Origin {
	readonly id = 'inchling';
	readonly powers: readonly string[] = [
		'nimble',
		'hyperactive',
		'small_appetite',
		'bite_sized',
		'poisonous',
	];
}
