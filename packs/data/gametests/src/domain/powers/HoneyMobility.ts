import { Player, world, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';

const HONEY_COOLDOWN_TICKS = TicksPerSecond * 20; // 20 seconds
const BOOST_DURATION_TICKS = TicksPerSecond * 5;  // 5 seconds

const honeyCooldowns = new Map<string, number>();

world.afterEvents.itemCompleteUse.subscribe((event) => {
    const player = event.source;
    if (!(player instanceof Player) || !player.isValid) return;

    if (event.itemStack.typeId !== 'minecraft:honey_bottle') return;
    if (!PlayerState.for(player).hasPower('honey_mobility')) return;

    const now = system.currentTick;
    const nextValidUse = honeyCooldowns.get(player.id) ?? 0;
    
    if (now < nextValidUse) {
        const secondsLeft = Math.ceil((nextValidUse - now) / TicksPerSecond);
        player.onScreenDisplay.setActionBar(`§cHoney Boost on cooldown! (${secondsLeft}s)`);
        return;
    }

    honeyCooldowns.set(player.id, now + HONEY_COOLDOWN_TICKS);

    player.addEffect('speed', BOOST_DURATION_TICKS, {
        amplifier: 1, // Speed II
        showParticles: true
    });

    player.playSound('random.orb', {
        location: player.location,
        volume: 0.5,
        pitch: 1.5
    });
    
    player.onScreenDisplay.setActionBar('§6⚡ Honey Mobility Boost Activated! ⚡');
});

@RegisterPower
export class HoneyMobility implements Power {
    readonly id = 'honey_mobility';
}