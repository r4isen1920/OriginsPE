import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Rootkin origin grants the ability to chain entities. */
@RegisterOrigin
export class Rootkin implements Origin {
	readonly id = 'rootkin';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'wrathroot',
		'vine_bind',
		'vine_bind_power',
		'leech_life',
		'flammable',
		'no_weapon',
	];
}
