import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Slimecican origin is very unpleasant to touch. */
@RegisterOrigin
export class Slimecican implements Origin {
	readonly id = 'slimecican';
	readonly powers: readonly string[] = [
		'bouncy_body',
		'super_jump',
		'sticky',
		'fragmentation',
		'recovery',
	];
}
