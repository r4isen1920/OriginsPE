import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Farmer implements CharacterClass {
	readonly id = 'farmer';
	readonly perks: readonly string[] = [
		'fast_grow_crop',
		'more_crops_drop',
	];
}
