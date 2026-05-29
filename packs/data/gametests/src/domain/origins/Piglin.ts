import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Piglin origin grants the ability to hoard items and have sturdy skin. */
@RegisterOrigin
export class Piglin implements Origin {
	readonly id = 'piglin';
	readonly powers: readonly string[] = [
		'pride',
		'boasting_firepower',
		'gluttony',
		'courage',
		'nether_inhabitant',
		'heavy_pockets',
	];
}
