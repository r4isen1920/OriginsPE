import {
    Player,
    world,
    TicksPerSecond,
    system,
    PlayerDimensionChangeAfterEvent
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { AfterPlayerDimensionChange } from '../../core/DecoratedEvents';


const NETHER_MIN_Y = 0;
const NETHER_MAX_Y = 120;
const SCAN_RADIUS = 16;


@RegisterPower
export class NetherInhabitant implements Power {
    readonly id = 'nether_spawn';

    @AfterPlayerDimensionChange
    static onDimensionChange(event: PlayerDimensionChangeAfterEvent): void {
        const { toDimension, player } = event;
        const state = PlayerState.for(player);

        if (!state.hasPower('nether_spawn')) return;
        if (state.getFlag<boolean>('nether_spawn_check') !== true) return;
        if (toDimension.id !== 'minecraft:nether') return;

        system.run(() => {
            const spawnLocation = NetherInhabitant.findSafeNetherSpot(player);
            if (!spawnLocation) return;

            player.teleport(spawnLocation);
            player.removeEffect('resistance');

            // Set spawnpoint at the safe location in the nether
            player.runCommand(
                `spawnpoint @s ${Math.floor(spawnLocation.x)} ${Math.floor(spawnLocation.y)} ${Math.floor(spawnLocation.z)}`
            );

            state.setFlag('nether_spawn_check', false);
            state.setFlag('nether_spawned', true);
        });
    }

    @PlayerTick(3)
    static onPlayerTick(player: Player): void {
        const state = PlayerState.for(player);

        if (!state.hasPower('nether_spawn')) {
            if (
                state.getFlag<boolean>('nether_spawned') === true ||
                state.getFlag<boolean>('nether_spawn_check') === true
            ) {
                state.setFlag('nether_spawned', false);
                state.setFlag('nether_spawn_check', false);
            }
            return;
        }

        if (
            state.getFlag<boolean>('nether_spawn_check') === true ||
            state.getFlag<boolean>('nether_spawned') === true
        ) return;

        player.addEffect('resistance', TicksPerSecond * 10, {
            amplifier: 255,
            showParticles: false,
        });

        player.teleport(player.location, {
            dimension: world.getDimension('minecraft:nether'),
        });

        state.setFlag('nether_spawn_check', true);
    }

    private static findSafeNetherSpot(player: Player): { x: number; y: number; z: number } | undefined {
        const dim = player.dimension;
        const baseX = Math.floor(player.location.x);
        const baseZ = Math.floor(player.location.z);

        for (let dx = 0; dx <= SCAN_RADIUS; dx++) {
            for (let dz = 0; dz <= SCAN_RADIUS; dz++) {
                for (const [sx, sz] of [[dx, dz], [-dx, dz], [dx, -dz], [-dx, -dz]]) {
                    const x = baseX + sx;
                    const z = baseZ + sz;

                    for (let y = NETHER_MAX_Y; y >= NETHER_MIN_Y + 2; y--) {
                        try {
                            const floor = dim.getBlock({ x, y: y - 1, z });
                            const feet  = dim.getBlock({ x, y, z });
                            const head  = dim.getBlock({ x, y: y + 1, z });

                            if (!floor || floor.isAir || floor.isLiquid) continue;
                            if (!feet  || !feet.isAir)  continue;
                            if (!head  || !head.isAir)  continue;

                            return { x: x + 0.5, y, z: z + 0.5 };
                        } catch {}
                    }
                }
            }
        }

        return { x: baseX + 0.5, y: 64, z: baseZ + 0.5 };
    }
}