import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Lumberjack implements CharacterClass {
	readonly id = 'lumberjack';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'tree_felling',
		'sapling_setblock',
	];
}
