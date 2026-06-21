import { Player, system, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';


/**
 * You take slight damage and debuffs when in contact with direct sunlight.
 */
@RegisterPower
export class Photosensitive implements Power {
    readonly id = 'photosensitive';

    onRelease(player: Player): void {
        player.removeEffect('weakness');
        PlayerState.for(player).setFlag('photosensitive_damage_cooldown', undefined);
    }

    @PlayerTick(10)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('photosensitive')) return;

        // Check if player is exposed to direct sunlight:
        // - Above sea level (y > 60)
        // - No solid block above them
        // - Daytime (between tick 0-12000)
        const loc = player.location;

        // Check for ceiling — if no solid block above, player is in the open
        let hasCeiling = false;
        for (let dy = 1; dy <= 10; dy++) {
            const above = player.dimension.getBlock({
                x: Math.floor(loc.x),
                y: Math.floor(loc.y) + dy,
                z: Math.floor(loc.z),
            });
            if (above && !above.isAir) {
                hasCeiling = true;
                break;
            }
        }

        // Use time command to check daylight
        let isDay = false;
        try {
            const result = player.runCommand('time query daytime');
            const ticks = parseInt((result as any).statusMessage?.match(/\d+/)?.[0] ?? '0');
            isDay = ticks >= 0 && ticks <= 12000;
        } catch {}

        const inDirectSunlight = !hasCeiling && isDay && loc.y > 60;

        if (inDirectSunlight) {
            player.addEffect('weakness', 100, { amplifier: 1, showParticles: true });

            const state = PlayerState.for(player);
            const now = system.currentTick;
            const lastDamage = state.getFlag<number>('photosensitive_damage_cooldown') ?? 0;

            if (now - lastDamage >= 20) {
                player.applyDamage(2);
                player.dimension.spawnParticle('r4isen1920_originspe:blaze_aura', player.location);
                state.setFlag('photosensitive_damage_cooldown', now);
            }
        } else {
            player.removeEffect('weakness');
        }
    }
}