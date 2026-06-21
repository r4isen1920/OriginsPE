import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


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
