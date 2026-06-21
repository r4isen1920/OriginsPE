import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Shulk origin grants the ability to phase through blocks and deal extra damage. */
@RegisterOrigin
export class Shulk implements Origin {
	readonly id = 'shulk';
	readonly difficulty = OriginDifficulty.Medium;
	readonly powers: readonly string[] = [
		'shulk_inventory',
		'natural_armor',
		'more_exhaustion',
		'no_shield',
		'strong_arms',
	];
}
