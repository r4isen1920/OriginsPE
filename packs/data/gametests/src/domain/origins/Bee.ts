import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Bee origin grants the ability to poison the enemies. */
@RegisterOrigin
export class Bee implements Origin {
	readonly id = 'bee';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'poison_bonus_damage',
		'sacrifice_stinger',
		'bloom',
		'nighttime',
		'lifespan',
	];
}
