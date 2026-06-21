import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Cook implements CharacterClass {
	readonly id = 'cook';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'better_stew',
		'more_saturated_food',
	];
}
