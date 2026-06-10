import { Origin, OriginDifficulty } from '../Ability';
import { RegisterOrigin } from '../Registries';


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
		'permeable',
	];
}
