import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


/**
 * You get strength and regeneration when underground.
 */
@RegisterPower
export class claustrophile implements Power {
    readonly id = 'claustrophile';

    @PlayerTick(10)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('claustrophile')) return;

        const loc = player.location;
        const block = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y),
            z: Math.floor(loc.z),
        });

        const isUnderground = loc.y < 60;
        const headBlock = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) + 2,
            z: Math.floor(loc.z),
        });
        const hasCeiling = headBlock !== undefined && !headBlock.isAir;

        const oneBlockGap = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) + 1,
            z: Math.floor(loc.z),
        });
        const hasOneBlockGap = oneBlockGap !== undefined && !oneBlockGap.isAir;

        if (isUnderground || hasCeiling || hasOneBlockGap || (block && !block.isAir)) {
            player.addEffect('strength', 250, { amplifier: 0, showParticles: true });
            player.addEffect('regeneration', 250, { amplifier: 0, showParticles: true });
        } else {
            player.removeEffect('strength');
            player.removeEffect('regeneration');
        }
    }
}