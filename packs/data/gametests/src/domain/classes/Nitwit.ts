import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Nitwit implements CharacterClass {
	readonly id = 'nitwit';
	readonly difficulty = ClassDifficulty.Nitwit;
	readonly perks: readonly string[] = [];
}
