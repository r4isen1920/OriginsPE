import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


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
