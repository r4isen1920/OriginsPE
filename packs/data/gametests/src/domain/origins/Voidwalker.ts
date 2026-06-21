import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Voidwalker origin grants the ability manipulate darkness. */
@RegisterOrigin
export class Voidwalker implements Origin {
	readonly id = 'voidwalker';
	readonly difficulty = OriginDifficulty.Hard;
	readonly powers: readonly string[] = [
		'beelzebub',
		'soulburst',
		'umbral_veil',
		'sinister_aura',
		'life_drain',
	];
}
