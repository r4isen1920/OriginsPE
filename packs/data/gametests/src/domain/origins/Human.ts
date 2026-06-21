import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Default origin used when the player has not picked one yet. */
@RegisterOrigin
export class Human implements Origin {
	readonly id = 'human';
	readonly difficulty = OriginDifficulty.Human;
	readonly powers: readonly string[] = [];
}
