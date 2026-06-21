import { CharacterClass, ClassDifficulty } from '../Ability';
import { RegisterClass } from '../Registries';


/** Default class with no perks beyond the global baseline. */
@RegisterClass
export class Merchant implements CharacterClass {
	readonly id = 'merchant';
	readonly difficulty = ClassDifficulty.Very;
	readonly perks: readonly string[] = [
		'cheaper_trades',
		'wandering_trader_spawn',
	];
}
