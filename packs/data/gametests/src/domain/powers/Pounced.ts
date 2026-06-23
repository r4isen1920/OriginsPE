import { Player, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

const CHARGE_SPEED_MULTIPLIER = 1.0; 
const POUNCE_VERTICAL_BOOST = 0.9;
const POUNCE_HORIZONTAL_BOOST = 1.8;


const COOLDOWN_KEY = 'pounce_cooldown';
const COOLDOWN_TICKS = TicksPerSecond * 5;
const COOLDOWN_BAR_ID = 6;
const MAX_CHARGE = 40; 

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

        state.setFlag('pounce_ready_to_charge', true);
        state.setFlag('pounce_hold_tick', 0);
        player.playSound('random.bowhit', { volume: 0.5, pitch: 0.6 });

        player.onScreenDisplay.setActionBar('§6Pounce Ready! §eSneak (Shift) to charge...');
    }

    onTick(player: Player): void {
        const state = PlayerState.for(player);
        const now = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, now)) {
            state.setFlag('pounce_hold_tick', 0);
            state.setFlag('pounce_ready_to_charge', false);
            return;
        }

        const isReadyToCharge = state.getFlag<boolean>('pounce_ready_to_charge') ?? false;
        const currentCharge = state.getFlag<number>('pounce_hold_tick') ?? 0;

        if (isReadyToCharge) {
            if (player.isSneaking) {
                const nextCharge = Math.min(currentCharge + (1 * CHARGE_SPEED_MULTIPLIER), MAX_CHARGE);
                state.setFlag('pounce_hold_tick', nextCharge);

                const chargePercent = (nextCharge / MAX_CHARGE) * 100;

                ResourceBarService.push(player, {
                    id: COOLDOWN_BAR_ID,
                    from: chargePercent,
                    to: chargePercent,
                    durationSeconds: 1,
                    persist: true
                });

                if (nextCharge >= MAX_CHARGE) {
                    Pounced.launch(player, state, now, nextCharge);
                }
            } 
            else if (currentCharge > 5) { 
                Pounced.launch(player, state, now, currentCharge);
            } 
            else if (currentCharge > 0 && !player.isSneaking) {
                state.setFlag('pounce_hold_tick', 0);
                ResourceBarService.pop(player, COOLDOWN_BAR_ID);
            }
        }

        if (state.getFlag<boolean>('pounce_launched') === true && player.isOnGround) {
            state.setFlag('pounce_launched', false);
            state.setCooldown(COOLDOWN_KEY, now, COOLDOWN_TICKS);

            ResourceBarService.pop(player, COOLDOWN_BAR_ID);
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
                try {
                    entity.runCommand(`damage @s 6 entity_attack damage_creator @p`);
                } catch {}
            }
        }
    }

    private static launch(player: Player, state: any, now: number, charge: number): void {
        state.setFlag('pounce_ready_to_charge', false);
        state.setFlag('pounce_hold_tick', 0);

        const viewDir = player.getViewDirection();
        const chargeRatio = charge / MAX_CHARGE; 

        const horizontalMultiplier = POUNCE_HORIZONTAL_BOOST * chargeRatio;
        const verticalMultiplier = POUNCE_VERTICAL_BOOST * chargeRatio;

        player.clearVelocity();
        player.applyImpulse({
            x: viewDir.x * horizontalMultiplier,
            y: Math.max(viewDir.y * verticalMultiplier + 0.3, 0.25), 
            z: viewDir.z * horizontalMultiplier
        });

        player.dimension.playSound('firework.launch', player.location, {
            volume: 1.0,
            pitch: 1.2,
        });

        state.setFlag('pounce_launched', true);
    }
}