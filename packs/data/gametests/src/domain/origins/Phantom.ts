import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Phantom origin turn into spectator mode. */
@RegisterOrigin
export class Phantom implements Origin {
	readonly id = 'phantom';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'phantomize',
		'invisibility',
		'burns_in_daylight',
	];
}
