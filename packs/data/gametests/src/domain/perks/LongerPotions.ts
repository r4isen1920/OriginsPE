import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';



@RegisterPerk
export class LongerPotions implements Perk {
	readonly id = 'longer_potions';
	
	//* Handled elswhere: see './cleric/'
}
