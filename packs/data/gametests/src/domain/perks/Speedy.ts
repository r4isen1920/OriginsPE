import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { AttributeOverrides } from '../../services';



@RegisterPerk
export class Speedy implements Perk {
    readonly id = 'speedy';

    readonly attributes: AttributeOverrides = {
		movement: { add: 0.025 },
		underwaterMovement: { add: 0.025 },
	}
}
