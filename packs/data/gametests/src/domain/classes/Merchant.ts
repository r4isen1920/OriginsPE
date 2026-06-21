import { CharacterClass, ClassDifficulty } from '../../core/abilities/Ability';
import { RegisterClass } from '../../core/abilities/Registries';


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
