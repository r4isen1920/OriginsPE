import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Rancher implements CharacterClass {
	readonly id = 'rancher';
	readonly perks: readonly string[] = [];
}
