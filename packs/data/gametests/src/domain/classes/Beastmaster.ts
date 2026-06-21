import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Beastmaster implements CharacterClass {
	readonly id = 'beastmaster';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'tamed_animal_boost',
		'effective_empathy',
	];
}
