import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Mole origin grants the ability scan nearby ores and dash any obstacles. */
@RegisterOrigin
export class Mole implements Origin {
	readonly id = 'mole';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'burrow_sense',
		'tunnel_leap',
		'claw_digging',
		'darkvision',
		'compact_size',
		'claustrophile',
		'photosensitive',
		'heavy_bones',
		'vegetarian'
	];
}
