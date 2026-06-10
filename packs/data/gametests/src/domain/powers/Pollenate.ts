import { Player, world, TicksPerSecond, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';
import { ResourceBarService } from '../../services/ResourceBarService';

/**
 * Pollenate: Allows the player to gather pollen from flowers, restoring stingers for use in combat.
 */

@RegisterPower
export class Pollenate implements Power {
	readonly id = 'pollenate';
	readonly tickInterval = 10;

	private static readonly log = Log.get('Pollenate');

	private static readonly COOLDOWN_BAR_ID = 18;
	private static readonly COOLDOWN_KEY = 'pollenate_cooldown';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 5;

	onTick(player: Player): void {
		const state = PlayerState.for(player);

		if (!player.isSneaking) return;

		const time = world.getTimeOfDay();
		const isDay = time >= 0 && time < 12000;
		if (!isDay) return;

		let stingers = state.getFlag<number>('bee_stingers_left');
		if (stingers === undefined) stingers = 7;
		if (stingers >= 7) return;

		const blockBelow = player.dimension.getBlock(player.location);
		if (!blockBelow || !blockBelow.isValid) return;

		const now = system.currentTick;
		if (state.isOnCooldown(Pollenate.COOLDOWN_KEY, now)) return;

		const blockId = blockBelow.typeId;
		const isFlower =
			blockId.includes('flower') ||
			blockId.includes('tulip') ||
			blockId.includes('rose') ||
			blockId.includes('orchid') ||
			blockId.includes('daisy') ||
			blockId.includes('allium') ||
			blockId.includes('bluet') ||
			blockId.includes('dandelion') ||
			blockId.includes('sunflower') ||
			blockId.includes('lilac') ||
			blockId.includes('peony') ||
			blockId.includes('poppy');

		if (isFlower) {
			stingers++;
			state.setFlag('bee_stingers_left', stingers);

			player.sendMessage(`§aPollen gathered! Stingers restored: ${stingers}/7§r`);

			player.dimension.spawnParticle('minecraft:crop_growth_emitter', player.location);
			player.dimension.playSound('block.bee_nest.work', player.location);

			blockBelow.setType('minecraft:air');

			state.setCooldown(Pollenate.COOLDOWN_KEY, now, Pollenate.COOLDOWN_TICKS);
			ResourceBarService.push(player, {
				id: Pollenate.COOLDOWN_BAR_ID,
				durationSeconds: 5
			});
		}
	}
}
