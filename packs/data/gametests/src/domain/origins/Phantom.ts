import { Origin, OriginDifficulty, OriginEffects } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';



@RegisterOrigin
export class Phantom implements Origin {
	readonly id = 'phantom';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'phantomize',
		'invisibility',
		'burns_in_daylight',
	];
	readonly effects: OriginEffects = {
		skin: 'ghostly',
	}
}
