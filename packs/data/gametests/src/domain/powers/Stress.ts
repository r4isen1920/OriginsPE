import { Player, system } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';
import { ResourceBarService } from '../../services/ResourceBarService';


const STRESS_KEY = 'r4isen1920_originspe:stress';
const BAR_ID = 9;


/** Display-only stub for the `stress` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Stress implements Power {
	readonly id = 'stress';
	readonly icon = '09';

	@PlayerTick(1)
    static onPlayerTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('stress_and_meditate')) return;

        const healthComponent = player.getComponent('health') as any;
        if (!healthComponent || healthComponent.currentValue <= 0) return;

        const currentStress = (player.getDynamicProperty(STRESS_KEY) as number) ?? 0;
        const isMissingHealth = (healthComponent.currentValue / healthComponent.effectiveMax) < 1.0;
        const isMeditating = player.isSneaking && !isMissingHealth;

        const newStress = Math.max(0, Math.min(100, currentStress + (isMeditating ? -1 : 0.05)));
        player.setDynamicProperty(STRESS_KEY, newStress);

        // Show stress bar - display as percentage (0-100)
        ResourceBarService.push(player, {
            id: BAR_ID,
            from: Math.floor(currentStress),
            to: Math.floor(newStress),
            durationSeconds: 1,
            persist: true,
        });

        // Max stress — explode and die
        if (newStress >= 100.0) {
            player.setDynamicProperty(STRESS_KEY, 0);
            player.dimension.spawnEntity('r4isen1920_originspe:huge_explosion', player.location);
            player.dimension.spawnParticle('r4isen1920_originspe:star_supernova', {
                x: player.location.x,
                y: player.location.y + 1,
                z: player.location.z,
            });
            player.kill();
        }
    }
}
