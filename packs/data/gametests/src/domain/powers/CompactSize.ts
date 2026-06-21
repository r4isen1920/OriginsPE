import { Player, ItemCompleteUseAfterEvent, world } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AfterItemCompleteUse } from '../../core/DecoratedEvents';
import { PlayerTick } from '../../core/Ticker';


/**
 * Your hitbox is reduced and you can move through 1-block high spaces without sneaking.
 */
@RegisterPower
export class CompactSize implements Power {
    readonly id = 'compact_size';

    @PlayerTick(5)
    static onPlayerTick(player: Player): void {
        const state = PlayerState.for(player);
        if (!state || !state.hasPower('compact_size')) return;

        // Apply size and health modifications
        player.triggerEvent('r4isen1920_originspe:scale.0.5');
        player.triggerEvent('r4isen1920_originspe:health.14');

        // player.camera.setCamera('r4isen1920_originspe:small');

        const location = player.location;
        const block = world.getDimension(player.dimension.id).getBlock({
            x: Math.floor(location.x),
            y: Math.floor(location.y) + 1,
            z: Math.floor(location.z)
        });

        if (block && !block.isAir) {
            player.addEffect('minecraft:speed', 20, { amplifier: 2, showParticles: false });
        }
    }
}