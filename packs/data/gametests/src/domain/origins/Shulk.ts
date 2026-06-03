import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Shulk origin grants the ability to phase through blocks and deal extra damage. */
@RegisterOrigin
export class Shulk implements Origin {
	readonly id = 'shulk';
	readonly powers: readonly string[] = [
		'shulk_inventory',
		'natural_armor',
		'large_appetite',
		'unwieldy',
		'strong_arms',
	];
}
