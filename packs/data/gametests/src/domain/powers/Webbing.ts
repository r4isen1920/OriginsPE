import { Power } from '../Ability';
import { RegisterPower } from '../Registries';


/**
 * Web-shooter / web-trap power for the Arachnid origin. The owner can place
 * cobwebs at a target location to slow nearby entities.
 *
 * Implementation deferred.
 */
@RegisterPower
export class Webbing implements Power {
	readonly id = 'webbing';
}
