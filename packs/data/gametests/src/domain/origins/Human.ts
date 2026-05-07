import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Default origin used when the player has not picked one yet. */
@RegisterOrigin
export class Human implements Origin {
	readonly id = 'human';
	readonly powers: readonly string[] = [];
}
