import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { Log } from '../../utils/Log';


/**
 * When sprinting, you become a shadow — gaining speed and projectile immunity.
 * Stopping sprint removes the effect and reveals you.
 */
@RegisterPower
export class UmbralVeil implements Power {
    private static readonly log = Log.get('UmbralVeil');

    readonly id = 'umbral_veil';
    readonly tickInterval = 2;

    onTick(player: Player): void {
        const state = PlayerState.for(player);
        const engaged = state.getFlag<boolean>('umbral_veil_engaged') === true;
        const particlePosition = {
            x: player.location.x,
            y: player.location.y + 1,
            z: player.location.z,
        };

        if (player.isSprinting) {
            this.trySpawnParticle(player, 'r4isen1920_originspe:voidwalker_veil_ground', particlePosition);
        }

        if (!player.isSprinting && engaged) {
            this.setSkinType(player, 'normal');
            player.removeEffect('speed');
            this.trySpawnParticle(player, 'r4isen1920_originspe:voidwalker_veil', particlePosition);
            state.setFlag('umbral_veil_engaged', false);
            return;
        }

        if (player.isSprinting && !engaged) {
            this.setSkinType(player, 'shadow');
            player.addEffect('speed', TicksPerSecond * 12, {
                amplifier: 0,
                showParticles: false,
            });

            this.tryPlaySound(player, 'respawn_anchor.charge');
            this.trySpawnParticle(player, 'r4isen1920_originspe:voidwalker_veil', particlePosition);
            state.setFlag('umbral_veil_engaged', true);
        }
    }

    private setSkinType(player: Player, value: 'normal' | 'shadow'): void {
        player.setDynamicProperty('r4isen1920_originspe:skin_type', value);
    }

    private tryPlaySound(player: Player, sound: string): void {
        player.dimension.playSound(sound, player.location, {
            volume: 0.5,
            pitch: 1.25,
        });
    }

    private trySpawnParticle(player: Player, particle: string, position: { x: number; y: number; z: number }): void {
        player.dimension.spawnParticle(particle, position);
    }
}
