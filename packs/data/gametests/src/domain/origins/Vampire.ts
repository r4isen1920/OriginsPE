import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';

/** Vampire origin grants the ability to blood tracking. */

@RegisterOrigin
export class Vampire implements Origin {
    readonly id = 'vampire';
    readonly difficulty = OriginDifficulty.Hard;
    readonly powers: readonly string[] = [
        'blood_sense',
        'berserks_blood',
        'night_falls',
        'life_steal',
        'rapture',
        'vampire_aura'
    ];
}
