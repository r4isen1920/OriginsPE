import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


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
