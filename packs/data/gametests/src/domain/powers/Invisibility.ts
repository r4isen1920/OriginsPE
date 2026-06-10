import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

/**
 * Allows you to become invisible, making you harder to detect by enemies.
 */

@RegisterPower
export class Invisibility implements Power {
	readonly id = 'invisibility';
}