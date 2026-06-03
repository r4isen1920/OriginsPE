import { Player, system, world } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { PlayerTick } from '../../core/Ticker';


function openShulkInv(player: Player): void {
	const existing = player.dimension.getEntities({
		type: 'r4isen1920_originspe:inventory_keep',
		tags: [`_inventory_keep_${player.id}`, '_inventory_keep_shulk'],
	})[0];

	const dummyEntity = existing ?? player.dimension.spawnEntity(
		'r4isen1920_originspe:inventory_keep',
		player.location,
	);

	dummyEntity.nameTag = 'origins.shulk_inventory';
	dummyEntity.addTag(`_inventory_keep_${player.id}`);
	dummyEntity.addTag('_inventory_keep_shulk');

	player.runCommand(
		`ride @s start_riding @e[type=r4isen1920_originspe:inventory_keep,tag="_inventory_keep_${player.id}",tag="_inventory_keep_shulk",c=1] teleport_ride`
	);
	player.onScreenDisplay.setTitle('origins.shulk_inventory');
	player.playSound('random.enderchestopen');
	player.dimension.spawnParticle('r4isen1920_originspe:shulk_inventory', {
		x: player.location.x,
		y: player.location.y + 1.5,
		z: player.location.z,
	});
	player.addTag('_shulk_inventory_open');
}

function closeShulkInv(player: Player): void {
	player.runCommand('ride @s stop_riding');
	player.onScreenDisplay.setTitle('origins.player_inventory');
	player.playSound('random.enderchestclosed');
	player.dimension.spawnParticle('r4isen1920_originspe:player_inventory', {
		x: player.location.x,
		y: player.location.y + 1.5,
		z: player.location.z,
	});

	for (const tag of player.getTags()) {
		if (tag.startsWith('_shulk_inventory')) player.removeTag(tag);
	}
}


/**
 * Trigger the ability to switch to a different inventory space.
 * Allowing you to store more items with 9 additional slots which are kept even upon death.
 */
@RegisterPower
export class ShulkInventory implements Power {
    readonly id = 'shulk_inventory';

    onRelease(player: Player): void {
        if (player.hasTag('_shulk_inventory_open')) {
            closeShulkInv(player);
        }
    }

    @PlayerTick(3)
	static onPlayerTick(player: Player): void {
		if (!PlayerState.for(player).hasPower('shulk_inventory')) return;

		// Keep inventory entity teleported to player
		if (!player.hasTag('_shulk_inventory_open')) {
			player.dimension.getEntities({
				type: 'r4isen1920_originspe:inventory_keep',
				tags: [`_inventory_keep_${player.id}`, '_inventory_keep_shulk'],
			})[0]?.teleport(player.location, { dimension: player.dimension });
		}

		// Handle control trigger — remove tag FIRST to prevent re-triggering
		if (!player.hasTag('_control_use_shulk_inventory')) return;
		player.removeTag('_control_use_shulk_inventory');

		if (player.hasTag('_shulk_inventory_open')) {
			closeShulkInv(player);
		} else {
			openShulkInv(player);
		}
}

    // Close inventory if player moves or jumps while it's open
    @PlayerTick(1)
    static onMovementTick(player: Player): void {
        if (!player.hasTag('_shulk_inventory_open')) return;

        const velocity = player.getVelocity();
        const isMoving = Math.abs(velocity.x) > 0.01 || Math.abs(velocity.z) > 0.01;
        const isJumping = velocity.y > 0.1;

        if (isMoving || isJumping) {
            closeShulkInv(player);
        }
    }
}