import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Enderian origin grants the ability to teleport and avoid water. */
@RegisterOrigin
export class Enderian implements Origin {
	readonly id = 'enderian';
	readonly powers: readonly string[] = [
		'teleportation',
		'scared_of_gourds',
		'familiar_face',
		'hydrophobia',
	];
}
