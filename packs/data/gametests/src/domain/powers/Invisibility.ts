import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

/**
 * Allows you to become invisible, making you harder to detect by enemies.
 */

@RegisterPower
export class Invisibility implements Power {
	readonly id = 'invisibility';
}