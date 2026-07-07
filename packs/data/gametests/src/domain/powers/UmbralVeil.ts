import { EntityDamageCause, EntityHurtBeforeEvent, Player, TicksPerSecond } from '@minecraft/server';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';


/**
 * Umbral Veil empowers sprinting with speed, projectile immunity, and hunger drain.
 */
@RegisterPower
export class UmbralVeil implements Power {
    private static readonly log = Logger.getLogger('OriginsPE', 'UmbralVeil');

    readonly id = 'umbral_veil';
    readonly tickInterval = 2;

    onRelease(player: Player): void {
        const state = PlayerState.for(player);
        state.setFlag('umbral_veil_engaged', false);
        this.setSkinType(player, 'normal');
        player.removeEffect(MinecraftEffectTypes.Speed);
        player.removeEffect(MinecraftEffectTypes.Hunger);
    }

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
            player.removeEffect(MinecraftEffectTypes.Speed);
            player.removeEffect(MinecraftEffectTypes.Hunger);
            this.trySpawnParticle(player, 'r4isen1920_originspe:voidwalker_veil', particlePosition);
            state.setFlag('umbral_veil_engaged', false);
            UmbralVeil.log.info(`Sprint veil disengaged for player: ${player.name}`);
            return;
        }

        if (player.isSprinting && !engaged) {
            this.setSkinType(player, 'shadow');
            player.addEffect(MinecraftEffectTypes.Speed, TicksPerSecond * 3, {
                amplifier: 0,
                showParticles: false,
            });
            player.addEffect(MinecraftEffectTypes.Hunger, TicksPerSecond * 3, {
                amplifier: 1,
                showParticles: false,
            });

            this.tryPlaySound(player, 'respawn_anchor.charge');
            this.trySpawnParticle(player, 'r4isen1920_originspe:voidwalker_veil', particlePosition);
            state.setFlag('umbral_veil_engaged', true);
            UmbralVeil.log.info(`Sprint veil engaged for player: ${player.name}`);
            return;
        }

        if (player.isSprinting) {
            player.addEffect(MinecraftEffectTypes.Speed, TicksPerSecond * 3, {
                amplifier: 0,
                showParticles: false,
            });
            player.addEffect(MinecraftEffectTypes.Hunger, TicksPerSecond * 3, {
                amplifier: 1,
                showParticles: false,
            });
        }
    }

    onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
        if (!player.isSprinting) return;
        if (ev.damageSource.cause === EntityDamageCause.magic) return;
        ev.cancel = true;
    }

    private setSkinType(player: Player, value: 'normal' | 'shadow'): void {
        player.setProperty('r4isen1920_originspe:skin_type', value);
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
