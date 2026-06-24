import { Player, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

const COOLDOWN_KEY = 'lightning_strike_cooldown';
const COOLDOWN_TICKS = TicksPerSecond * 3;
const COOLDOWN_BAR_ID = 27;
const STRIKE_RADIUS = 6;
const LIGHTNING_DAMAGE = 6;

@RegisterPower
export class LightningStrike implements Power {
    readonly id = 'lightning_strike';
    readonly icon = '27';

    readonly active = {
        icon: '27',
        name: 'origins.trait.lightning_strike.name',
        cooldownKey: COOLDOWN_KEY,
    };

    onActivate(player: Player): void {
        const state = PlayerState.for(player);
        const now = system.currentTick;

        if (state.isOnCooldown(COOLDOWN_KEY, now)) {
            player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
            return;
        }

        const targets = player.dimension.getEntities({
            location: player.location,
            maxDistance: STRIKE_RADIUS,
            excludeFamilies: ['player', 'inanimate']
        });

        if (targets.length === 0) {
            player.onScreenDisplay.setActionBar('§cNo entities nearby to strike!');
            player.playSound('note.bass', { volume: 0.5, pitch: 1.0 });
            return;
        }

        state.setCooldown(COOLDOWN_KEY, now, COOLDOWN_TICKS);

        ResourceBarService.push(player, {
            id: COOLDOWN_BAR_ID,
            durationSeconds: 3,
        });

        player.addEffect('fire_resistance', 60, { showParticles: false });
        player.addEffect('resistance', 10, { amplifier: 4, showParticles: false });

        for (const entity of targets) {
            const loc = entity.location;
            player.dimension.runCommand(`summon lightning_bolt ${loc.x} ${loc.y} ${loc.z}`);
            entity.runCommand(`damage @s ${LIGHTNING_DAMAGE} lightning entity @p`);
        }

        system.runTimeout(() => {
            if (player.isValid) {
                player.removeEffect('resistance');
            }
        }, 2);
    }
}