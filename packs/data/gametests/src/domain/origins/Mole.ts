import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Mole origin grants the ability scan nearby ores and dash any obstacles. */
@RegisterOrigin
export class Mole implements Origin {
	readonly id = 'mole';
	readonly powers: readonly string[] = [
		'burrow_sense',
		'tunnel_leap',
		'claw_digging',
		'darkvision',
		'compact_size',
		'claustrophile',
		'photosensitive',
		'poor_swimmer',
	];
}
