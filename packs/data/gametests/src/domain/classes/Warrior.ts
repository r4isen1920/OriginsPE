import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Combat-oriented class. */
@RegisterClass
export class Warrior implements CharacterClass {
	readonly id = 'warrior';
	readonly perks: readonly string[] = [
		'less_health_more_attack',
		'shield_wield',
	];
}
