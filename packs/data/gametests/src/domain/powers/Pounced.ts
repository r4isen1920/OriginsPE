import { Player, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { ResourceBarService } from '../../services/ResourceBarService';


const COOLDOWN_KEY = 'pounce_cooldown';
const COOLDOWN_TICKS = TicksPerSecond * 5;
const COOLDOWN_BAR_ID = 6;
const MAX_CHARGE = 10;


@RegisterPower
export class Pounced implements Power {
    readonly id = 'pounce';
    readonly icon = '06';

    readonly active = {
        icon: '06',
        name: 'origins.trait.pounce.name',
        cooldownKey: COOLDOWN_KEY,
    };

    onActivate(player: Player): void {
        const state = PlayerState.for(player);
        const now = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, now)) {
            player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
            return;
        }

        // Start charging
        state.setFlag('pounce_charging', true);
        state.setFlag('pounce_hold_tick', 0);
    }

    onTick(player: Player): void {
        const state = PlayerState.for(player);
        const now = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, now)) {
            state.setFlag('pounce_hold_tick', 0);
            state.setFlag('pounce_charging', false);
            return;
        }

        const isCharging = state.getFlag<boolean>('pounce_charging') ?? false;
        const currentCharge = state.getFlag<number>('pounce_hold_tick') ?? 0;

        if (isCharging) {
            const nextCharge = Math.min(currentCharge + 1, MAX_CHARGE);
            state.setFlag('pounce_hold_tick', nextCharge);

            const chargePercent = Math.floor((nextCharge / MAX_CHARGE) * 100);
            player.onScreenDisplay.setActionBar(`§6Charging Pounce: §e${chargePercent}%`);

            // Auto-release at max charge
            if (nextCharge >= MAX_CHARGE) {
                Pounced.launch(player, state, now, nextCharge);
            }
        }

        // Landing check
        if (state.getFlag<boolean>('pounce_launched') === true && player.isOnGround) {
            state.setFlag('pounce_launched', false);
            state.setCooldown(COOLDOWN_KEY, now, COOLDOWN_TICKS);

            ResourceBarService.push(player, {
                id: COOLDOWN_BAR_ID,
                durationSeconds: 5,
            });

            player.dimension.playSound('random.explode', player.location, {
                volume: 0.6,
                pitch: 1.5,
            });
            player.dimension.spawnParticle('r4isen1920_originspe:air_burst', {
                x: player.location.x,
                y: player.location.y + 0.5,
                z: player.location.z,
            });

            const targets = player.dimension.getEntities({
                location: player.location,
                maxDistance: 4,
                excludeFamilies: ['inanimate'],
            });

            for (const entity of targets) {
                if (entity.id === player.id) continue;
                entity.runCommand(`damage @s 6 entity_attack attack @p`);
            }
        }
    }

    private static launch(player: Player, state: any, now: number, charge: number): void {
        state.setFlag('pounce_charging', false);
        state.setFlag('pounce_hold_tick', 0);

        const viewDir = player.getViewDirection();
        const launchForce = charge / 4;

        player.applyKnockback({ x: viewDir.x, z: viewDir.z }, launchForce);
        player.applyImpulse({ x: 0, y: launchForce * 0.4, z: 0 });

        player.dimension.playSound('firework.launch', player.location, {
            volume: 1.0,
            pitch: 1.0,
        });

        state.setFlag('pounce_launched', true);
    }
}