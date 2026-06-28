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
        'electric_aura',
        'lightning_strike',
        'storm_born',
        'static_field'
    ];
}
