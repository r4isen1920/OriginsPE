import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Miner implements CharacterClass {
	readonly id = 'miner';
	readonly difficulty = ClassDifficulty.Decent;
	readonly perks: readonly string[] = [
		'ore_vein_miner',
		'no_mining_exhaustion',
	];
}
