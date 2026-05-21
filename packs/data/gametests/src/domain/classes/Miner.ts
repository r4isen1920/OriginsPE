import { CharacterClass } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Miner implements CharacterClass {
	readonly id = 'miner';
	readonly perks: readonly string[] = [
		'ore_vein_miner',
	];
}
