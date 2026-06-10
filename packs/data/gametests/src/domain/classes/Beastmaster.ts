import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


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
