import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Cleric implements CharacterClass {
	readonly id = 'cleric';
	readonly perks: readonly string[] = [];
}
