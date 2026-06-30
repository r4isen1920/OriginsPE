import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

function openShulkInv(player: Player): void {
	const existing = player.dimension.getEntities({
		type: 'r4isen1920_originspe:inventory_keep',
		tags: [`_inventory_keep_${player.id}`, '_inventory_keep_shulk']
	})[0];

	const dummyEntity =
		existing ??
		player.dimension.spawnEntity('r4isen1920_originspe:inventory_keep', player.location);

	dummyEntity.nameTag = 'origins.shulk_inventory';
	dummyEntity.addTag(`_inventory_keep_${player.id}`);
	dummyEntity.addTag('_inventory_keep_shulk');

	player.runCommand(
		`ride @s start_riding @e[type=r4isen1920_originspe:inventory_keep,tag="_inventory_keep_${player.id}",tag="_inventory_keep_shulk",c=1] teleport_ride`
	);
	player.onScreenDisplay.setActionBar('_op:inv.shulk');
	player.playSound('random.enderchestopen');
	player.dimension.spawnParticle('r4isen1920_originspe:shulk_inventory', {
		x: player.location.x,
		y: player.location.y + 1.5,
		z: player.location.z
	});
	player.addTag('_shulk_inventory_open');
}

function closeShulkInv(player: Player): void {
	player.runCommand('ride @s stop_riding');
	player.onScreenDisplay.setActionBar('_op:inv.player');
	player.playSound('random.enderchestclosed');
	player.dimension.spawnParticle('r4isen1920_originspe:player_inventory', {
		x: player.location.x,
		y: player.location.y + 1.5,
		z: player.location.z
	});

	for (const tag of player.getTags()) {
		if (tag.startsWith('_shulk_inventory')) player.removeTag(tag);
	}
}

@RegisterPower
export class ShulkInventory implements Power {
	readonly id = 'shulk_inventory';
	readonly tickInterval = 1;

	readonly active = {
		icon: '30',
		name: 'origins.trait.shulk_inventory.label'
	};

	onRelease(player: Player): void {
		if (player.hasTag('_shulk_inventory_open')) {
			closeShulkInv(player);
		}
	}

	onActivate(player: Player): void {
		if (player.hasTag('_shulk_inventory_open')) {
			closeShulkInv(player);
		} else {
			openShulkInv(player);
		}
	}

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('shulk_inventory')) return;

		if (!player.hasTag('_shulk_inventory_open')) {
			player.dimension
				.getEntities({
					type: 'r4isen1920_originspe:inventory_keep',
					tags: [`_inventory_keep_${player.id}`, '_inventory_keep_shulk']
				})[0]
				?.teleport(player.location, { dimension: player.dimension });
		}

		if (player.hasTag('_shulk_inventory_open')) {
			const velocity = player.getVelocity();
			const isMoving = Math.abs(velocity.x) > 0.01 || Math.abs(velocity.z) > 0.01;
			const isJumping = velocity.y > 0.1;

			if (isMoving || isJumping) {
				closeShulkInv(player);
			}
		}
	}
}
