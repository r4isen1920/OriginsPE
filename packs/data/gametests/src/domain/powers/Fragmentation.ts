import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/** Display-only stub for the `fragmentation` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Fragmentation implements Power {
	readonly id = 'fragmentation';
	readonly icon = '08';
}
