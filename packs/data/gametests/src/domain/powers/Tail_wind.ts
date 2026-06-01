import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

/**
 * Tail wind power for avian origins. Grants a speed boost when sprinting.
 * The speed boost is applied via the data-driven attribute event suffix.
 */
@RegisterPower
export class Tail_wind implements Power {
	readonly id = 'tail_wind';
	readonly attributes = {
		movement: 0.15,
	} satisfies NonNullable<Power['attributes']>;
}
