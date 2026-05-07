import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/**
 * Granted by default to every player. Acts as a passive marker that other
 * systems (e.g. web placement / web-trap lifetime) can key off of.
 *
 * Implementation deferred.
 */
@RegisterPower
export class MasterOfWebs implements Power {
	readonly id = 'master_of_webs';
}
