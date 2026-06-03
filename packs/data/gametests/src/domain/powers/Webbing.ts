import { EntityHitEntityAfterEvent, Player, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Log } from '../../utils/Log';

/**
 * Web-shooter / web-trap power for the Arachnid origin. The owner can place
 * cobwebs at a target location to slow nearby entities.
 *
 * Implementation deferred.
 */
@RegisterPower
export class Webbing implements Power {
	readonly id = 'webbing';

	private static readonly log = Log.get('Webbing');

	private static readonly COOLDOWN_BAR_ID = 24;
	private static readonly COOLDOWN_KEY = 'webbing';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 13;

	onAttack(player: Player, event: EntityHitEntityAfterEvent): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;
		if (state.isOnCooldown(Webbing.COOLDOWN_KEY, now)) return;

		state.setCooldown(Webbing.COOLDOWN_KEY, now, Webbing.COOLDOWN_TICKS);
		ResourceBarService.push(player, {
			id: Webbing.COOLDOWN_BAR_ID,
			durationSeconds: 13
		});

		player.dimension
			.spawnEntity('r4isen1920_originspe:webbing_attack', event.hitEntity.location)
			.triggerEvent('r4isen1920_originspe:start_webbing_control');

		const loc = event.hitEntity.location;
		const block1 = player.dimension.getBlock({
			x: Math.floor(loc.x),
			y: Math.floor(loc.y),
			z: Math.floor(loc.z)
		});

		if (block1?.isAir) block1.setType('minecraft:web');
	}
}
