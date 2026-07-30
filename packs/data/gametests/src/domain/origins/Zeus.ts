import { Origin, OriginDifficulty } from '../../core/abilities/Ability';
import { RegisterOrigin } from '../../core/abilities/Registries';


/** Zeus origin When the skies darken and the air crackles with static, 
 *  know that Taranis is watching. Do not seek the storm, or you will become the lightning rod. 
 * */
@RegisterOrigin
export class Zeus implements Origin {
    readonly id = 'zeus';
    readonly difficulty = OriginDifficulty.Hard;
    readonly powers: readonly string[] = [
        'wrath_of_olympus',
        'divine_ascent',
        'static_energy',
        'discharge',
        'surge_protection',
        'claustrophobic',
        'severed_connection'
    ];
}
