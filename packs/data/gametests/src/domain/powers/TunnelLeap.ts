import { ItemStack, Player, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';


const COOLDOWN_KEY = 'tunnel_leap_cooldown';
const COOLDOWN_TICKS = 300;
const MAX_TUNNEL_DISTANCE = 8;
const TUNNEL_WIDTH = 1;
const TUNNEL_HEIGHT = 2;

const BREAKABLE_BLOCKS: Record<string, string> = {
    'minecraft:dirt':            'minecraft:dirt',
    'minecraft:coarse_dirt':     'minecraft:dirt',
    'minecraft:rooted_dirt':     'minecraft:dirt',
    'minecraft:grass_block':     'minecraft:grass_block',
    'minecraft:grass':           'minecraft:grass',
    'minecraft:dirt_with_roots': 'minecraft:dirt_with_roots',
    'minecraft:farmland':        'minecraft:dirt',
    'minecraft:mycelium':        'minecraft:mycelium',
    'minecraft:sand':            'minecraft:sand',
    'minecraft:gravel':          'minecraft:gravel',
    'minecraft:clay':            'minecraft:clay',
    'minecraft:soul_sand':       'minecraft:soul_sand',
    'minecraft:soul_soil':       'minecraft:soul_soil',
    'minecraft:snow':            'minecraft:snow',
    'minecraft:snow_layer':      'minecraft:snow',
    'minecraft:red_sand':        'minecraft:red_sand',
    'minecraft:mud':             'minecraft:mud',
    'minecraft:podzol':          'minecraft:podzol',
};


/**
 * Tunnel Leap — burrow forward through soft terrain and launch in your view direction.
 */
@RegisterPower
export class TunnelLeap implements Power {
    readonly id = 'tunnel_leap';

    readonly active = {
        icon: '23',
        name: 'origins.trait.tunnel_leap.name',
        cooldownKey: COOLDOWN_KEY,
    };

    onActivate(player: Player): void {
        const state = PlayerState.for(player);
        const currentTick = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, currentTick)) {
            player.playSound('note.bass', { volume: 1, pitch: 1.5 });
            return;
        }

        const viewDir = player.getViewDirection();
        const horizontalDir = { x: viewDir.x, y: 0, z: viewDir.z };

        // Dig tunnel
        for (let i = 0; i <= MAX_TUNNEL_DISTANCE; i++) {
            const pos = {
                x: player.location.x + horizontalDir.x * i,
                y: player.location.y,
                z: player.location.z + horizontalDir.z * i,
            };

            for (let x = -TUNNEL_WIDTH; x <= TUNNEL_WIDTH; x++) {
                for (let y = -1; y <= TUNNEL_HEIGHT; y++) {
                    for (let z = -TUNNEL_WIDTH; z <= TUNNEL_WIDTH; z++) {
                        const blockPos = {
                            x: pos.x + x,
                            y: pos.y + y,
                            z: pos.z + z,
                        };

                        try {
                            const block = player.dimension.getBlock(blockPos);
                            if (!block) continue;

                            const itemToSpawn = BREAKABLE_BLOCKS[block.typeId];
                            if (!itemToSpawn) continue;

                            let breakSound = 'dig.grass';
                            if (block.typeId.includes('sand') || block.typeId.includes('gravel')) {
                                breakSound = 'dig.sand';
                            } else if (block.typeId.includes('snow')) {
                                breakSound = 'dig.snow';
                            }

                            player.playSound(breakSound, { volume: 1.0, pitch: 1.0 });
                            block.setType('minecraft:air');

                            player.dimension.spawnItem(
                                new ItemStack(itemToSpawn, 1),
                                { x: blockPos.x + 0.5, y: blockPos.y + 0.5, z: blockPos.z + 0.5 },
                            );

                            player.dimension.spawnParticle('minecraft:terrain_particle minecraft:dirt', blockPos);
                        } catch {}
                    }
                }
            }
        }

        // Launch player forward with a slight upward impulse.
        const horizontalLength = Math.sqrt(viewDir.x * viewDir.x + viewDir.z * viewDir.z);
        const launchImpulse = horizontalLength > 0
            ? {
                x: (viewDir.x / horizontalLength) * 1.2,
                y: 0.35,
                z: (viewDir.z / horizontalLength) * 1.2,
            }
            : { x: 0, y: 0.35, z: 0 };

        player.applyImpulse(launchImpulse);

        player.dimension.spawnParticle('minecraft:terrain_particle minecraft:dirt', {
            x: player.location.x,
            y: player.location.y + 0.5,
            z: player.location.z,
        });
        player.playSound('item.trident.riptide_1', { volume: 0.8, pitch: 1.0 });

        state.setCooldown(COOLDOWN_KEY, currentTick, COOLDOWN_TICKS);
        state.setFlag('tunnel_leap_expiry', currentTick + COOLDOWN_TICKS);

        ResourceBarService.push(player, {
            id: 23,
            durationSeconds: 15,
        });
    }
}