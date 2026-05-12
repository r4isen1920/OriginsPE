import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Phantom origin turn into spectator mode. */
@RegisterOrigin
export class Phantom implements Origin {
	readonly id = 'phantom';
	readonly powers: readonly string[] = [
		'phantomize',
		'spiritual_body',
		'undead',
	];
}
