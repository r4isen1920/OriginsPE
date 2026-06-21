import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Elytrian origin grants the ability to glide and fly using elytra. */
@RegisterOrigin
export class Elytrian implements Origin {
	readonly id = 'elytrian';
	readonly difficulty = OriginDifficulty.Easy;
	readonly powers: readonly string[] = [
		'launch_into_air',
		'elytra',
		'light_armor',
		'claustrophobia',
		'more_kinetic_damage',
		'aerial_combatant',
	];
}
