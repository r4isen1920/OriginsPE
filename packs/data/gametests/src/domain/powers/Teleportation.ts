import { Player, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';

@RegisterPower
export class Teleportation implements Power {
	readonly id = 'throw_ender_pearl';
	readonly tickInterval = 3;

	readonly active = {
		icon: '03',
		name: 'origins.trait.throw_ender_pearl.name',
		cooldownKey: 'teleportation_cooldown'
	};

	private static readonly COOLDOWN_BAR_ID = 3;
	private static readonly COOLDOWN_TICKS = 100;

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		const currentTick = system.currentTick;

		if (!state.isOnCooldown('teleportation_cooldown', currentTick)) {
			const targetBlockRay = player.getBlockFromViewDirection({
				maxDistance: 64,
				includeLiquidBlocks: false
			});

			if (!targetBlockRay) {
				player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
				return;
			}

			const { block, face } = targetBlockRay;
			let targetLocation = { ...block.location };

			switch (face) {
				case 'Down':
					targetLocation.y -= 1;
					break;
				case 'Up':
					targetLocation.y += 1;
					break;
				case 'North':
					targetLocation.z -= 1;
					break;
				case 'South':
					targetLocation.z += 1;
					break;
				case 'West':
					targetLocation.x -= 1;
					break;
				case 'East':
					targetLocation.x += 1;
					break;
			}

			player.dimension.playSound('mob.endermen.portal', player.location);
			player.dimension.playSound('mob.endermen.portal', targetLocation);

			player.teleport(targetLocation, { dimension: block.dimension });

			state.setCooldown('teleportation_cooldown', currentTick, Teleportation.COOLDOWN_TICKS);
			state.setFlag('teleportation_expiry', currentTick + Teleportation.COOLDOWN_TICKS);

			ResourceBarService.push(player, {
				id: Teleportation.COOLDOWN_BAR_ID,
				durationSeconds: 5
			});
		} else {
			player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
		}
	}
}
