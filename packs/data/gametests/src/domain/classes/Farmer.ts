import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


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
