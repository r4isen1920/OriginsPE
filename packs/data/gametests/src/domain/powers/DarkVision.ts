import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';
import { isPlayerUnderground } from './ClawDigging';


/**
 * Grants night vision when in dark areas.
 */
@RegisterPower
export class Darkvision implements Power {
    readonly id = 'darkvision';

    @PlayerTick(10)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('darkvision')) return;

        if (isPlayerUnderground(player)) {
            player.addEffect('night_vision', 250, { amplifier: 0, showParticles: false });
        } else {
            player.removeEffect('night_vision');
        }
    }
}