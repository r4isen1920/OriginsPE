import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Piglin origin grants the ability to hoard items and have sturdy skin. */
@RegisterOrigin
export class Piglin implements Origin {
	readonly id = 'piglin';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'pride',
		'increased_attack_per_entity',
		'gluttony',
		'courage',
		'nether_spawn',
		'heavy_pockets',
	];
}
