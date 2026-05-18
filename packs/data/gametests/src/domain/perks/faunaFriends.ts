import { Player } from '@minecraft/server';

import { Perk } from '../Ability';
import { RegisterPerk } from '../Registries';


/**
 * Animals you tame receive a permanent buff to their health.
 */
@RegisterPerk
export class FaunaFriends implements Perk {
	readonly id = 'fauna_friends';

}
