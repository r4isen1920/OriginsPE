import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Rogue implements CharacterClass {
	readonly id = 'rogue';
	readonly perks: readonly string[] = [
		'Sneaky',
		'Stealth',
	];
}
