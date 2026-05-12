import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Lumberjack implements CharacterClass {
	readonly id = 'lumberjack';
	readonly perks: readonly string[] = [];
}
