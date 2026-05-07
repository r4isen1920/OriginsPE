import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Nitwit implements CharacterClass {
	readonly id = 'nitwit';
	readonly perks: readonly string[] = [];
}
