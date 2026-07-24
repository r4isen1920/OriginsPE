import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/**
 * Oracle: passive Diviner power. Under Prescience, damage and healing are
 * distributed evenly across the linked group. The distribution pipeline lives in
 * {@link DivinerLink} so it can act on non-Diviner members that lack this power.
 */
@RegisterPower
export class Oracle implements Power {
	readonly id = 'oracle';
}
