import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { EntityDamageCause, Player } from '@minecraft/server';
import { PlayerTick } from '../../core/Ticker';
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
	@PlayerTick(1)
	static onTick(player: Player) {
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'arachnid') return;

		if (!player.isJumping) return;

		const ray = player.getBlockFromViewDirection({ maxDistance: 2.5 });
		const block = ray?.block;

		if (block && !block.isAir && !this.IGNORED_BLOCKS.includes(block.typeId)) {
			const currentY = player.getVelocity().y;
			const targetSpeed = 0.3;
			const upwardForce = Math.max(0, targetSpeed - currentY);

			if (upwardForce > 0) {
				player.applyImpulse({ x: 0, y: upwardForce + 0.03, z: 0 });
			}
		}
	}

	onDamageTaken(player: Player, cause: EntityDamageCause, damage: number): number {
		const state = PlayerState.for(player);

		if (state.getOrigin() === 'arachnid' && cause === EntityDamageCause.fall) {
			return damage * 0.01;
		}
		return damage;
	}
}
