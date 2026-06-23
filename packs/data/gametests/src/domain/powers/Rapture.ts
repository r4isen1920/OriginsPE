import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

/** Any successful attack on a player or mob inflicts a specialized Bleeding status effect.  */

@RegisterPower
export class Rapture implements Power {
	readonly id = 'rapture';
	
}
