import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';

/** Cat-like origin granting agility and stealth. */
@RegisterOrigin
export class Feline implements Origin {
	readonly id = 'feline';
	readonly difficulty = OriginDifficulty.Medium;
	readonly powers: readonly string[] = [
		'fall_immunity',
		'sprint_jump',
		'nine_lives',
		'cat_vision',
		'weak_arms',
		'scare_creepers',
	];
}
