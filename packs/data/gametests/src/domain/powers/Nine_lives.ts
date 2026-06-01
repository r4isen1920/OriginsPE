import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

/**
 * Nine lives attribute layer for the feline power.
 */

@RegisterPower
export class NineLives implements Power {
	readonly id = 'nine_lives';
	readonly attributes = {
		health: 18,
	} satisfies NonNullable<Power['attributes']>;
}
