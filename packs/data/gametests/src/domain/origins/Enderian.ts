import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Enderian origin grants the ability to teleport and avoid water. */
@RegisterOrigin
export class Enderian implements Origin {
	readonly id = 'enderian';
	readonly difficulty = OriginDifficulty.Medium;
	readonly powers: readonly string[] = [
		'throw_ender_pearl',
		'pumpkin_hate',
		'familiar_face',
		'water_vulnerability',
	];
}
