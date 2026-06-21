import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Nitwit implements CharacterClass {
	readonly id = 'nitwit';
	readonly difficulty = ClassDifficulty.Nitwit;
	readonly perks: readonly string[] = [];
}
