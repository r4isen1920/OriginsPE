import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Fox origin grants the ability to utilize their inner spiritual abilities. */
@RegisterOrigin
export class Fox implements Origin {
	readonly id = 'fox';
	readonly powers: readonly string[] = [
		'camouflage',
		'fast_footed',
		'pounced',
		'berry_craver',
		'smaller_heart',
		'fast_metabolism',
		'strong_ankles',
	];
}
