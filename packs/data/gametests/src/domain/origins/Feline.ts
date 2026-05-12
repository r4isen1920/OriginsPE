import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';

/** Cat-like origin granting agility and stealth. */
@RegisterOrigin
export class Feline implements Origin {
	readonly id = 'feline';
	readonly powers: readonly string[] = [
		'strong_ankles',
		'acrobatics',
		'nine_lives',
		'nocturnal',
		'weak_arms',
		'catlike_appearance',
	];
}
