import { Player, ItemCompleteUseAfterEvent, world } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { AfterItemCompleteUse } from '../../core/DecoratedEvents';
import { PlayerTick } from '../../core/Ticker';

@RegisterPower
export class BiteSized implements Power {
	readonly id = 'bite_sized';

    @PlayerTick(5)
    static onPlayerTick(player: Player): void {
        const state = PlayerState.for(player);
        if (!state || !state.hasPower('bite_sized')) return;

        // Apply size and health modifications
        player.triggerEvent('r4isen1920_originspe:scale.0.25');
        player.triggerEvent('r4isen1920_originspe:health.10');

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
