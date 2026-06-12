import { EntityHitEntityAfterEvent, Player, system, TicksPerSecond } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { ResourceBarService } from '../../services/ResourceBarService';
/**
 * Web-shooter / web-trap power for the Arachnid origin. The owner can place
 * cobwebs at a target location to slow nearby entities.
 *
 * Implementation deferred.
 */
@RegisterPower
export class Webbing implements Power {
	readonly id = 'webbing';
	readonly icon = '01';
	readonly tickInterval = 1;

	private static readonly COOLDOWN_BAR_ID = 1;
	private static readonly COOLDOWN_KEY = 'webbing';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 13;

	onAttack(player: Player, event: EntityHitEntityAfterEvent): void {
		const target = event.hitEntity;
		if (!target || !target.isValid) return;

		const state = PlayerState.for(player);
		const now = system.currentTick;
		if (state.isOnCooldown(Webbing.COOLDOWN_KEY, now)) return;

		state.setCooldown(Webbing.COOLDOWN_KEY, now, Webbing.COOLDOWN_TICKS);
		ResourceBarService.push(player, {
			id: Webbing.COOLDOWN_BAR_ID,
			durationSeconds: 13
		});

		const trapEntity = player.dimension.spawnEntity(
			'r4isen1920_originspe:webbing_attack',
			target.location
		);

		if (trapEntity && trapEntity.isValid) {
			trapEntity.triggerEvent('r4isen1920_originspe:start_webbing_control');
		}

		const loc = target.location;
		const block1 = player.dimension.getBlock({
			x: Math.floor(loc.x),
			y: Math.floor(loc.y),
			z: Math.floor(loc.z)
		});

		if (block1?.isAir) {
			block1.setType('r4isen1920_originspe:fake_cobweb');
		}
	}
}
