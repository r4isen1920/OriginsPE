import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Diviner origin grants the ability to manipulate divine energy. */
@RegisterOrigin
export class Diviner implements Origin {
	readonly id = 'diviner';
	readonly powers: readonly string[] = [
		'prescience',
		'oracle',
		'aegis',
		'divine_aura',
		'fragility',
		'instability',
	];
}
