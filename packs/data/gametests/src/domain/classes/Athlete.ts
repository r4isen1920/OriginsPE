import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


@RegisterClass
export class Athlete implements CharacterClass {
	readonly id = 'athlete';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'bunny_jump',
		'speed_regulator',
	];
}
