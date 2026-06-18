import { Origin, OriginDifficulty, OriginEffects } from '../Ability';
import { RegisterOrigin } from '../Registries';
import { AttributeOverrides } from '../../services/Attributes';
import { PlayerLifecycle } from '../PlayerLifecycle';

/** Elven origin grants the ability to weave life. */

@RegisterOrigin
export class Elf implements Origin {
	readonly id = 'elf';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'lifeweaver',
		'endless_quiver',
		'imbue',
		'agility',
		'permeable'
	];
	readonly effects: OriginEffects = {
		emitter: 'elven'
	};
}
