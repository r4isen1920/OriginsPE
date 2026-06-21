import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/** Display-only stub for the `shooting_star` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class ShootingStar implements Power {
	readonly id = 'shooting_star';
	readonly icon = '11';
}
