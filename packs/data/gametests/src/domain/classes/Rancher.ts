import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Rancher implements CharacterClass {
	readonly id = 'rancher';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'twin_breeding',
		'more_animal_loot',
	];
}
