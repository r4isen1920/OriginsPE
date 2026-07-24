import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';


/**
 * Aegis: passive Diviner power. Prevents fatal damage for the whole linked group
 * (Totem-like) on a shared 120-second cooldown shown as a resource bar. The
 * fatal-prevention pipeline lives in {@link DivinerLink} so it can protect
 * non-Diviner members that lack this power.
 */
@RegisterPower
export class Aegis implements Power {
	readonly id = 'aegis';
	readonly icon = '33';
}
