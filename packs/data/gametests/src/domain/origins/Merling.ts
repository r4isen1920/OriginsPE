import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Merling origin grants the ability to breathe underwater and swim faster. */
@RegisterOrigin
export class Merling implements Origin {
	readonly id = 'merling';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'water_breathing',
		'aqua_affinity',
		'sea_creature',
		'like_water',
		'no_trident_damage',
	];
}
