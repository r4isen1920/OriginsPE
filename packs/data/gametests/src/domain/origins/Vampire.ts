import { Origin, OriginDifficulty, OriginEffects } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';

/** Vampire origin grants the ability to blood tracking. */

@RegisterOrigin
export class Vampire implements Origin {
    readonly id = 'vampire';
    readonly difficulty = OriginDifficulty.Hard;
    readonly powers: readonly string[] = [
        'bat_form',
        'bloodthirsty',
        'death_sense',
        'nocturnal',
        'regenerative',
        'undead'
    ];
	readonly effects: OriginEffects = {
		emitter: 'vampire',
	}
}
