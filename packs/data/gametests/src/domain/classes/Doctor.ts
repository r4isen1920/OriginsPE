import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Combat-oriented class. */
@RegisterClass
export class Doctor implements CharacterClass {
	readonly id = 'doctor';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'instant_heal_potion',
		'quick_regen',
	];
}
