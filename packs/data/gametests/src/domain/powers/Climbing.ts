import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { EntityDamageCause, Player } from '@minecraft/server';
import { PlayerState } from '../../core/PlayerState';
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

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'arachnid') return;

		if (!player.isJumping) return;

		const viewDir = player.getViewDirection();
		if (viewDir.y > 0.3) return;

		const ray = player.getBlockFromViewDirection({ maxDistance: 2.5 });
		const block = ray?.block;

		if (block && !block.isAir && !Climbing.IGNORED_BLOCKS.includes(block.typeId)) {
			const playerFloorY = Math.floor(player.location.y);

			if (block.location.y < playerFloorY) return;

			if (block.location.y === playerFloorY) {
				const blockAbove = block.above();
				if (!blockAbove || blockAbove.isAir) {
					player.applyImpulse({
						x: viewDir.x * 0.15,
						y: 0.25,
						z: viewDir.z * 0.15
					});
					return;
				}
			}

			const horizontalDistX = Math.abs(block.location.x + 0.5 - player.location.x);
			const horizontalDistZ = Math.abs(block.location.z + 0.5 - player.location.z);
			if (horizontalDistX < 0.8 && horizontalDistZ < 0.8) return;

			const currentY = player.getVelocity().y;
			const targetSpeed = 0.2;

			let upwardForce = 0;

			if (currentY < 0) {
				upwardForce = targetSpeed;
				player.clearVelocity();
			} else {
				upwardForce = Math.max(0, targetSpeed - currentY);
			}

			if (upwardForce > 0) {
				player.applyImpulse({ x: 0, y: upwardForce + 0.01, z: 0 });
			}
		}
	}

	onDamageTaken(player: Player, cause: EntityDamageCause, damage: number): number {
		if (!player.isValid) return damage;

		const state = PlayerState.for(player);

		if (state.getOrigin() === 'arachnid' && cause === EntityDamageCause.fall) {
			return damage * 0.01;
		}

		return damage;
	}
}
