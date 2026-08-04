import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';



@RegisterPerk
export class PowerfulPotions implements Perk {
	readonly id = 'powerful_potions';
	
	//* Handled elswhere: see './cleric/'
}
