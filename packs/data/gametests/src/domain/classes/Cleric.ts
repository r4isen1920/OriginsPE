import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Cleric implements CharacterClass {
	readonly id = 'cleric';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [];
}
