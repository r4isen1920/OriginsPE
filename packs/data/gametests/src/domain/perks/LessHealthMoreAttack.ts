import { AttributeSet } from '../../services/AttributeService';
import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Warrior signature perk: trades max health for higher base attack. Both
 * values are applied via the data-driven attribute layer.
 */
@RegisterPerk
export class LessHealthMoreAttack implements Perk {
	readonly id = 'less_health_more_attack';
	readonly attributes: Partial<AttributeSet> = {
		health: '16',
		attack: '2',
	};
}
