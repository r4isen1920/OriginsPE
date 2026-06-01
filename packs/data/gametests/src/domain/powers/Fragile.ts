import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/**
 * Reduced max-health attribute layer for fragile origins (Arachnid).
 * Lower health is applied via the data-driven attribute event suffix.
 */
@RegisterPower
export class Fragile implements Power {
	readonly id = 'fragile';
	readonly attributes = {
		health: 14,
	} satisfies NonNullable<Power['attributes']>;
}
