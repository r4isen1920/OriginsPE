import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `tunnel_leap` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class TunnelLeap implements Power {
	readonly id = 'tunnel_leap';
	readonly icon = '23';
}
