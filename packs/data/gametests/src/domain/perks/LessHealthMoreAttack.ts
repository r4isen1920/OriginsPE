import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Warrior signature perk: trades max health for higher base attack. Both
 * values are applied via the data-driven attribute layer.
 */
@RegisterPerk
export class LessHealthMoreAttack implements Perk {
	readonly id = 'less_health_more_attack';
	readonly attributes = {
		health: '16',
		attack: '2',
	} satisfies NonNullable<Perk['attributes']>;
}
