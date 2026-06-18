import { Player, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';

@RegisterPower
export class BiteSized implements Power {
	readonly id = 'bite_sized';

    onAcquire(player: Player): void {
        player.triggerEvent('r4isen1920_originspe:scale.0.25');
        player.triggerEvent('r4isen1920_originspe:health.10');
        player.triggerEvent('r4isen1920_originspe:family_type.bite_sized');
    }
}
