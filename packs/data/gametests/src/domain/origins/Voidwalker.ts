import { Origin } from '../Ability';
import { RegisterOrigin } from '../Registries';


/** Voidwalker origin grants the ability manipulate darkness. */
@RegisterOrigin
export class Voidwalker implements Origin {
	readonly id = 'voidwalker';
	readonly powers: readonly string[] = [
		'beelzebub',
		'soulburst',
		'umbral_veil',
		'sinister_aura',
		'life_drain',
	];
}
