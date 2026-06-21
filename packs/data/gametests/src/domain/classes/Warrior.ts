import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


/** Combat-oriented class. */
@RegisterClass
export class Warrior implements CharacterClass {
	readonly id = 'warrior';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'less_health_more_attack',
		'less_shield_slowdown',
	];
}
