import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Explorer implements CharacterClass {
	readonly id = 'explorer';
	readonly perks: readonly string[] = [];
}
