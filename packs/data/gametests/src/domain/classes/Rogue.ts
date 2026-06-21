import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Rogue implements CharacterClass {
	readonly id = 'rogue';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'sneaky',
		'stealth',
	];
}
