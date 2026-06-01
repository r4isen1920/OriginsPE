import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class Smaller_heart implements Power {
	readonly id = 'smaller_heart';
	readonly attributes = {
		health: 12,
	} satisfies NonNullable<Power['attributes']>;
}
