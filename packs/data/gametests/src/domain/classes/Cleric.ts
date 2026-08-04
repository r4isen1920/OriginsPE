import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';



@RegisterClass
export class Cleric implements CharacterClass {
	readonly id = 'cleric';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'longer_potions',
		'powerful_potions',
	];
}
