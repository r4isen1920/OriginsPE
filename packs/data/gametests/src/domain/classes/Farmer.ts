import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Farmer implements CharacterClass {
	readonly id = 'farmer';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'fast_crop_growth',
		'more_crop_drops',
	];
}
