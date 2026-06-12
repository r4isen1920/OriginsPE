import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { EntityDamageCause, Player } from '@minecraft/server';
import { PlayerState } from '../../core/PlayerState';
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
		'minecraft:vine',
		'minecraft:yellow_flower',
		'minecraft:weeping_vines',
		'minecraft:tall_grass',
		'minecraft:short_grass',
		'minecraft:water'
	];

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'arachnid') return;

		if (!player.isJumping) return;

		const viewDir = player.getViewDirection();
		if (viewDir.y > 0.3) return;

		const ray = player.getBlockFromViewDirection({ maxDistance: 1.5 });
		let block = ray?.block;

		if (!block || block.isAir) {
			const blockAtFeet = player.dimension.getBlock({
				x: Math.floor(player.location.x + viewDir.x * 0.5),
				y: Math.floor(player.location.y),
				z: Math.floor(player.location.z + viewDir.z * 0.5)
			});

			if (
				blockAtFeet &&
				!blockAtFeet.isAir &&
				!Climbing.IGNORED_BLOCKS.includes(blockAtFeet.typeId)
			) {
				block = blockAtFeet;
			}
		}

		if (block && !block.isAir && !Climbing.IGNORED_BLOCKS.includes(block.typeId)) {
			const playerFloorY = Math.floor(player.location.y);

			if (block.location.y < playerFloorY) return;

			if (block.location.y === playerFloorY) {
				const blockAbove = block.above();
				if (!blockAbove || blockAbove.isAir) {
					player.applyImpulse({
						x: viewDir.x * 0.1,
						y: 0.1,
						z: viewDir.z * 0.1
					});
					return;
				}
			}

			const velocity = player.getVelocity();
			const targetSpeed = 0.2;
			let upwardForce = 0;

			if (velocity.y < 0) {
				upwardForce = targetSpeed;
				player.clearVelocity();
			} else {
				upwardForce = Math.max(0, targetSpeed - velocity.y);
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
