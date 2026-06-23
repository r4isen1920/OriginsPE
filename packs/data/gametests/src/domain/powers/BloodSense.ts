import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

/** Blood Sense locates low-health players on the map. */

@RegisterPower
export class BloodSense implements Power {
	readonly id = 'blood_sense';
	
}
