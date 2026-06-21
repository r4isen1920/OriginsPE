import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Blacksmith implements CharacterClass {
	readonly id = 'blacksmith';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'quality_equipment',
	];
}
