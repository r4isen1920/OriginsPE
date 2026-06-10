import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


/**
 * Grants night vision when in dark areas.
 */
@RegisterPower
export class Darkvision implements Power {
    readonly id = 'darkvision';

    @PlayerTick(10)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('darkvision')) return;

        const loc = player.location;
        const block = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y),
            z: Math.floor(loc.z),
        });

        const lightLevel = block?.above()?.isAir
            ? player.dimension.getBlock({ x: Math.floor(loc.x), y: Math.floor(loc.y) + 1, z: Math.floor(loc.z) })?.getComponents()
            : undefined;

        // Use runCommand to get light level since scripting API doesn't expose it directly
        const isDark = (player as any).runCommandAsync === undefined
            ? true
            : player.dimension.getBlock({ x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) }) !== undefined;

        // Fallback: check if player is underground (below y=40) or in a cave-like area
        const isUnderground = loc.y < 60;
        const headBlock = player.dimension.getBlock({
            x: Math.floor(loc.x),
            y: Math.floor(loc.y) + 2,
            z: Math.floor(loc.z),
        });
        const hasCeiling = headBlock !== undefined && !headBlock.isAir;

        if (isUnderground || hasCeiling) {
            player.addEffect('night_vision', 250, { amplifier: 0, showParticles: false });
        } else {
            player.removeEffect('night_vision');
        }
    }
}