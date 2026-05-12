import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Merling origin grants the ability to breathe underwater and swim faster. */
@RegisterOrigin
export class Merling implements Origin {
	readonly id = 'merling';
	readonly powers: readonly string[] = [
		'gills',
		'aqua_affinity',
		'sea_inhabitant',
		'like_water',
		'oceans_gift',
	];
}
