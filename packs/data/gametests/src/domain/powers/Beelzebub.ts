import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `beelzebub` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Beelzebub implements Power {
	readonly id = 'beelzebub';
	readonly icon = '19';
}
