import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Blazeborn origin grants the ability to withstand fire and lava. */
@RegisterOrigin
export class Blazeborn implements Origin {
	readonly id = 'blazeborn';
	readonly powers: readonly string[] = [
		'impervious',
		'nether_inhabitant',
		'ember',
		'hotblooded',
		'hydrophobia',
	];
}
