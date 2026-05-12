import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Elytrian origin grants the ability to glide and fly using elytra. */
@RegisterOrigin
export class Elytrian implements Origin {
	readonly id = 'elytrian';
	readonly powers: readonly string[] = [
		'gift_of_the_winds',
		'winged',
		'need_for_mobility',
		'claustrophobia',
		'brittle_bones',
		'aerial_combatant'
	];
}
