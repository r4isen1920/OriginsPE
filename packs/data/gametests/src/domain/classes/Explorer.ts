import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Explorer implements CharacterClass {
	readonly id = 'explorer';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'explorer_kit',
		'no_sprint_exhaustion',
	];
}
