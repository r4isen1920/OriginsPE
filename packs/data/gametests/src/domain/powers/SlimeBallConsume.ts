import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `slime_ball_consume` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class SlimeBallConsume implements Power {
	readonly id = 'slime_ball_consume';
	readonly icon = '08';
}
