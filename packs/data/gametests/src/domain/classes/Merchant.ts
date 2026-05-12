import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Merchant implements CharacterClass {
	readonly id = 'merchant';
	readonly perks: readonly string[] = [];
}
