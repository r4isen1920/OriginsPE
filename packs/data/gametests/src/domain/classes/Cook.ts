import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Cook implements CharacterClass {
	readonly id = 'cook';
	readonly perks: readonly string[] = [];
}
