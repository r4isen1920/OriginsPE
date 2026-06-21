import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Diviner origin grants the ability to manipulate divine energy. */
@RegisterOrigin
export class Diviner implements Origin {
	readonly id = 'diviner';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'prescience',
		'oracle',
		'aegis',
		'divine_aura',
		'fragility',
		'instability',
	];
}
