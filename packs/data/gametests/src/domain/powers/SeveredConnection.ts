import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

const ALLOWED_DIMENSION_ID = 'minecraft:overworld';

@RegisterPower
export class SeveredConnection implements Power {
    readonly id = 'severed_connection';

    /**
     * The End and Nether have no open sky — Wrath of Olympus can't be called down
     * outside the Overworld. Returns true if the player is in overworld inorder 
     * for the power is allowed to activate.
     */
    
    static canCallLightning(player: Player): boolean {
        return player.dimension.id === ALLOWED_DIMENSION_ID;
    }
}