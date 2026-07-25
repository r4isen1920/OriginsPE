import { EntityComponentTypes, GameMode, Player, system, world } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';
import { ResourceBarService } from '../../services/ResourceBarService';
import { AttributeOverrides } from '../../services';


const STRESS_KEY = 'r4isen1920_originspe:stress';
const BAR_ID = 9;


/** Display-only stub for the `stress` trait. Carries its powers-list icon; behavior not yet implemented. */
@RegisterPower
export class Stress implements Power {
	readonly id = 'stress';
	readonly icon = '09';
	readonly tickInterval = 1;

	readonly attributes: AttributeOverrides = {
		emitterType: 'starborne',
	};

	onTick(player: Player): void {
		if (player.getGameMode() === GameMode.Creative) {
			ResourceBarService.pop(player, BAR_ID); // hide for now
			return;
		}

        const healthComponent = player.getComponent(EntityComponentTypes.Health);
        if (!healthComponent || healthComponent.currentValue <= 0) return;

        const currentStress = (player.getDynamicProperty(STRESS_KEY) as number) ?? 0;
        const isMissingHealth = (healthComponent.currentValue / healthComponent.effectiveMax) < 1.0;
        const isMeditating = player.isSneaking && !isMissingHealth;

        const newStress = Math.max(0, Math.min(100, currentStress + (isMeditating ? -0.5 : 0.05)));
        player.setDynamicProperty(STRESS_KEY, newStress);

        // Show stress bar - display as percentage (0-100)
        ResourceBarService.push(player, {
            id: BAR_ID,
			slot: 1,
            from: Math.floor(currentStress),
            to: Math.floor(newStress),
            persist: true,
        });

        // Max stress — explode and die
        if (newStress >= 100.0) {
            player.setDynamicProperty(STRESS_KEY, 0);
            player.dimension.createExplosion(player.location, 10, {
				breaksBlocks: world.gameRules.mobGriefing,
				causesFire: false,
			});
            player.dimension.spawnParticle('r4isen1920_originspe:star_supernova', {
                x: player.location.x,
                y: player.location.y + 1,
                z: player.location.z,
            });
            player.kill();
        }
    }
}
