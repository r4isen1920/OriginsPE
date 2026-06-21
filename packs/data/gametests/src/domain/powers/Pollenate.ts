import { Player, world, TicksPerSecond, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { Log } from '../../utils/Log';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Stingers } from './Stingers';

/**
 * Pollenate: Allows the player to gather pollen from flowers, restoring stingers for use in combat.
 */

@RegisterPower
export class Pollenate implements Power {
	readonly id = 'bloom';
	readonly icon = '18';
	readonly tickInterval = 2;

	private static readonly log = Log.get('Pollenate');

	private static readonly BAR_ID = 18;
	private static readonly COOLDOWN_KEY = 'pollenate_cooldown';
	private static readonly CHARGE_KEY = 'pollenate_charge_start';
	private static readonly CHARGE_FLOWER_KEY = 'pollenate_charge_flower';
	private static readonly CHARGE_TICKS = TicksPerSecond * 5;
	private static readonly MAX_STINGERS = 7;

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		if (state.isOnCooldown(Pollenate.COOLDOWN_KEY, now)) return;

		if (!player.isSneaking) {
			this.cancelCharge(player, state);
			return;
		}

		const time = world.getTimeOfDay();
		const isDay = time >= 0 && time < 12000;
		if (!isDay) {
			this.cancelCharge(player, state);
			return;
		}

		const stingers = state.getFlag<number>('bee_stingers_left') ?? Pollenate.MAX_STINGERS;
		if (stingers >= Pollenate.MAX_STINGERS) {
			this.cancelCharge(player, state);
			return;
		}

		const blockBelow = player.dimension.getBlock(player.location);
		if (!blockBelow?.isValid) {
			this.cancelCharge(player, state);
			return;
		}

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

		if (!isFlower) {
			this.cancelCharge(player, state);
			return;
		}

		const chargeStart = state.getFlag<number>(Pollenate.CHARGE_KEY);
		const chargeFlower = state.getFlag<string>(Pollenate.CHARGE_FLOWER_KEY);

		if (chargeStart === undefined || chargeFlower !== blockId) {
			state.setFlag(Pollenate.CHARGE_KEY, now);
			state.setFlag(Pollenate.CHARGE_FLOWER_KEY, blockId);
			ResourceBarService.push(player, {
				id: Pollenate.BAR_ID,
				durationSeconds: 5
			});
			return;
		}

		if (now - chargeStart < Pollenate.CHARGE_TICKS) return;

		const newStingers = stingers + 1;
		state.setFlag('bee_stingers_left', newStingers);
		Stingers.pushStingerBar(player, newStingers);

		player.dimension.spawnParticle('minecraft:crop_growth_emitter', player.location);
		player.dimension.playSound('block.bee_nest.work', player.location);

		blockBelow.setType('minecraft:air');

		state.setFlag(Pollenate.CHARGE_KEY, undefined);
		state.setFlag(Pollenate.CHARGE_FLOWER_KEY, undefined);
		state.setCooldown(Pollenate.COOLDOWN_KEY, now, Pollenate.CHARGE_TICKS);
	}

	private cancelCharge(player: Player, state: ReturnType<typeof PlayerState.for>): void {
		if (state.getFlag(Pollenate.CHARGE_KEY) === undefined) return;
		state.setFlag(Pollenate.CHARGE_KEY, undefined);
		state.setFlag(Pollenate.CHARGE_FLOWER_KEY, undefined);
		ResourceBarService.pop(player, Pollenate.BAR_ID);
	}
}
