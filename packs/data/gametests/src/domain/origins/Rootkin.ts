import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Rootkin origin grants the ability to chain entities. */
@RegisterOrigin
export class Rootkin implements Origin {
	readonly id = 'rootkin';
	readonly powers: readonly string[] = [
		'wrathroot',
		'vine_bind',
		'chain_break',
		'leech_life',
		'flammable',
		'barehanded',
	];
}
