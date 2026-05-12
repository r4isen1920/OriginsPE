import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Bee origin grants the ability to poison the enemies. */
@RegisterOrigin
export class Bee implements Origin {
	readonly id = 'bee';
	readonly powers: readonly string[] = [
		'fatality',
		'stingers',
		'pollenate',
		'diurnal',
		'short_lifespan',
	];
}
