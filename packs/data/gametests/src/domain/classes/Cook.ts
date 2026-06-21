import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


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
