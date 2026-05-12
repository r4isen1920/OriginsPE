import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Beastmaster implements CharacterClass {
	readonly id = 'beastmaster';
	readonly perks: readonly string[] = [];
}
