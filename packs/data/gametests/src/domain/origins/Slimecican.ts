import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Slimecican origin is very unpleasant to touch. */
@RegisterOrigin
export class Slimecican implements Origin {
	readonly id = 'slimecican';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'bouncy_body',
		'high_jump',
		'sticky',
		'fragmentation',
		'slime_ball_consume',
	];
}
