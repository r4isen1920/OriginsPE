import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


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
