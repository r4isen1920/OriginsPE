import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

@RegisterPower
export class SinisterAura implements Power {
    readonly id = 'sinister_aura';
}
