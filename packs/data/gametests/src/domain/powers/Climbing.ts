import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { EntityDamageCause, Player, system, world } from '@minecraft/server';
/**
 * Wall-climb passive. The actual physics is driven by an attached entity
 * component / animation controller bound by the data-driven event triggered
 * via origin effects; this class exists so the tick loop and damage hooks can
 * see the player as having the power.
 */
@RegisterPower
export class Climbing implements Power {
	readonly id = 'climbing';

	private readonly IGNORED_BLOCKS: string[] = [
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
		system.runInterval(() => {
			for (const player of world.getAllPlayers()) {
				this.runClimbLogic(player);
			}
		}, 1);
	}

	private runClimbLogic(player: Player): void {
		if (!player.hasTag('power_climbing')) return;

		if (!player.isJumping) {
			player.removeTag('_climbing');
			return;
		}

		const ray = player.getBlockFromViewDirection({ maxDistance: 2.5 });
		const block = ray?.block;

		if (block && !block.isAir && !this.IGNORED_BLOCKS.includes(block.typeId)) {
			const currentY = player.getVelocity().y;
			const targetSpeed = 0.3;
			const upwardForce = Math.max(0, targetSpeed - currentY);

			if (upwardForce > 0) {
				player.applyImpulse({ x: 0, y: upwardForce + 0.03, z: 0 });
			}

			player.addTag('_climbing');
		} else {
			player.removeTag('_climbing');
		}
	}

	onDamageTaken(player: Player, cause: EntityDamageCause, damage: number): number {
		if (player.hasTag('_climbing') && cause === EntityDamageCause.fall) {
			return damage * 0.01;
		}
		return damage;
	}
}
