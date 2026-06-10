import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Blazeborn origin grants the ability to withstand fire and lava. */
@RegisterOrigin
export class Blazeborn implements Origin {
	readonly id = 'blazeborn';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'fire_immunity',
		'nether_spawn',
		'burning_wrath',
		'hotblooded',
		'water_vulnerability',
	];
}
