import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { EntityDamageCause, Player } from '@minecraft/server';
import { PlayerState } from '../../core/PlayerState';
import { Ticker } from '../../core/Ticker';
import { Log } from '../../utils/Log';
/**
 * Wall-climb passive. The actual physics is driven by an attached entity
 * component / animation controller bound by the data-driven event triggered
 * via origin effects; this class exists so the tick loop and damage hooks can
 * see the player as having the power.
 */
@RegisterPower
export class Climbing implements Power {
	readonly id = 'climbing';
	readonly tickInterval = 1;

	private static readonly log = Log.get('Climbing');

	private static readonly IGNORED_BLOCKS: string[] = [
		'minecraft:cave_vines',
		'minecraft:cave_vines_body_with_berries',
		'minecraft:cave_vines_head_with_berries',
		'minecraft:ladder',
		'minecraft:red_flower',
		'minecraft:seagrass',
		'minecraft:scaffolding',
		'minecraft:tallgrass',
		'minecraft:vine',
		'minecraft:yellow_flower',
		'minecraft:weeping_vines'
	];

	constructor() {
		try {
			Ticker.everyPlayer(this.tickInterval, (player) => this.onTick(player), {
				id: `power.${this.id}`
			});
		} catch (error: any) {
			Climbing.log.error(
				`Failed to register Ticker hook for Climbing: ${error?.stack ?? error}`
			);
		}
	}

	onTick(player: Player): void {
		try {
			if (!player.isValid) return;

			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'arachnid') return;

			if (!player.isJumping) return;

			const ray = player.getBlockFromViewDirection({ maxDistance: 2.5 });
			const block = ray?.block;

			if (block && !block.isAir && !Climbing.IGNORED_BLOCKS.includes(block.typeId)) {
				const currentY = player.getVelocity().y;
				const targetSpeed = 0.15;

				let upwardForce = 0;

				if (currentY < 0) {
					upwardForce = targetSpeed;
					player.clearVelocity();
				} else {
					upwardForce = Math.max(0, targetSpeed - currentY);
				}

				if (upwardForce > 0) {
					player.applyImpulse({ x: 0, y: upwardForce + 0.001, z: 0 });
				}
			}
		} catch (error: any) {
			Climbing.log.error(
				`[${player.name ?? 'Unknown Player'}] Error in onTick loop: ${error?.stack ?? error}`
			);
		}
	}

	onDamageTaken(player: Player, cause: EntityDamageCause, damage: number): number {
		try {
			if (!player.isValid) return damage;

			const state = PlayerState.for(player);

			if (state.getOrigin() === 'arachnid' && cause === EntityDamageCause.fall) {
				return damage * 0.01;
			}
		} catch (error: any) {
			Climbing.log.error(
				`[${player.name ?? 'Unknown Player'}] Error in onDamageTaken: ${error?.stack ?? error}`
			);
		}
		return damage;
	}
}
