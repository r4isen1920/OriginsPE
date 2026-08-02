
import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { AttributeOverrides } from '../../services';

@RegisterPerk
export class Strong implements Perk {
    readonly id = 'strong';

    readonly attributes: AttributeOverrides = {
        attack: { add: 1 },
    }
}