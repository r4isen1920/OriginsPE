import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Archer implements CharacterClass {
	readonly id = 'archer';
	readonly perks: readonly string[] = [
		'agility',
		'precision',
	];
}
