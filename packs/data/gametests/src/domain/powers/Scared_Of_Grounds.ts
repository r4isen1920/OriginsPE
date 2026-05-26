import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class Scared_Of_Grounds implements Power {
    readonly id = 'scared_of_grounds';
    private static readonly log = Log.get('Scared_Of_Grounds');

    @PlayerTick(3)
    static onPlayerTick(player: Player): void {
        try {
            const state = PlayerState.for(player);
            if (state.getOrigin() !== 'enderian') return;

            const inventoryComp = player.getComponent('inventory');
            if (!inventoryComp?.container) return;

            let hasPumpkin = false;

            for (let i = 0; i < inventoryComp.container.size; i++) {
                const item = inventoryComp.container.getItem(i);
                if (item && item.typeId.includes('pumpkin')) {
                    hasPumpkin = true;
                    break;
                }
            }

            if (hasPumpkin) {
                player.triggerEvent('r4isen1920_originspe:is_shaking.true');
                player.addEffect('weakness', TicksPerSecond * 12, { amplifier: 1 });
            } else {
                player.triggerEvent('r4isen1920_originspe:is_shaking.false');
            }
        } catch (error: any) {
            Scared_Of_Grounds.log.error(`Error inside Scared_Of_Grounds tick handler: ${error?.stack ?? error}`);
        }
    }
}