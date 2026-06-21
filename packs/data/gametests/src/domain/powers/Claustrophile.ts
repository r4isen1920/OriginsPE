import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';
import { isPlayerUnderground } from './ClawDigging';


/**
 * You get strength and regeneration when underground.
 */
@RegisterPower
export class claustrophile implements Power {
    readonly id = 'claustrophile';

    @PlayerTick(10)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('claustrophile')) return;

        if (isPlayerUnderground(player)) {
            player.addEffect('strength', 250, { amplifier: 0, showParticles: true });
            player.addEffect('regeneration', 250, { amplifier: 0, showParticles: true });
        } else {
            player.removeEffect('strength');
            player.removeEffect('regeneration');
        }
    }
}