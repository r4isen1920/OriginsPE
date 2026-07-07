import { Origin, OriginDifficulty, OriginEffects } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';

/** Elven origin centered around sustain, precision, and bow mastery. */

@RegisterOrigin
export class Elf implements Origin {
	readonly id = 'elf';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'lifeweaver',
		'endless_quiver',
		'imbued_shots',
		'elegant',
		'swift',
		'permeable'
	];
	readonly effects: OriginEffects = {
		emitter: 'elven'
	};
}
