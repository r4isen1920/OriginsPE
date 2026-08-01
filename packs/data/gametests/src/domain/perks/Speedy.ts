import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { AttributeOverrides } from '../../services';



@RegisterPerk
export class Speedy implements Perk {
    readonly id = 'speedy';

    readonly attributes: AttributeOverrides = {
		movement: 0.11,
		underwaterMovement: 0.11,
	}
}
