import { Entity, EntityComponentTypes, Player, PlayerDimensionChangeAfterEvent, system, world } from '@minecraft/server';
import { Logger, Vec3 } from '@bedrock-oss/bedrock-boost';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { Log } from '../../utils';



//#region POWER

@RegisterPower
export class ShulkInventory implements Power {
	private static readonly log = Log.get('ShulkInventory');

	readonly id = 'shulk_inventory';
	readonly tickInterval = 1;

	readonly active = {
		icon: '30',
		name: 'origins.trait.shulk_inventory.label',
	};


	private readonly OPEN_FLAG = 'shulk_inventory_open';
	private readonly INV_ENTITY_TYPE = 'r4isen1920_originspe:inventory_keep';
	private readonly OWNER_DP_KEY = 'shulk_inventory:owner_id';
	private readonly IS_SHULK_DP_KEY = 'shulk_inventory:is_shulk';

	private readonly PAYLOAD_OPEN = '_op:inv.shulk';
	private readonly PAYLOAD_CLOSED = '_op:inv.player';


	onAcquire(player: Player): void {
		PlayerState.for(player).setFlag(this.OPEN_FLAG, false);
		ShulkInventory.log.info(`acquired, for: ${player.name}`);
		system.runTimeout(() => {
			if (!player.isValid) return;
			const isOpen = PlayerState.for(player).getFlag<boolean>(this.OPEN_FLAG) ?? false;
			player.onScreenDisplay.setActionBar(isOpen ? this.PAYLOAD_OPEN : this.PAYLOAD_CLOSED);
		}, 20);
	}

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<boolean>(this.OPEN_FLAG)) {
			ShulkInventory.log.info(`closing on release, for: ${player.name}`);
			this.close(player);
		}
		player.onScreenDisplay.setActionBar('_op:');
	}

	onActivate(player: Player): void {
		const isOpen = PlayerState.for(player).getFlag<boolean>(this.OPEN_FLAG) ?? false;
		if (isOpen) {
			this.close(player);
		} else {
			this.open(player);
		}
	}

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state?.hasPower('shulk_inventory')) return;

		const isOpen = state.getFlag<boolean>(this.OPEN_FLAG) ?? false;

		if (!isOpen) {
			this.findEntity(player)?.teleport(player.location, { dimension: player.dimension });
			return;
		}

		const velocity = player.getVelocity();
		const isMoving = Math.abs(velocity.x) > 0.01 || Math.abs(velocity.z) > 0.01;
		const isJumping = velocity.y > 0.1;

		if (isMoving || isJumping) {
			this.close(player);
		}
	}

	onDimensionChange(player: Player, _ev: PlayerDimensionChangeAfterEvent): void {
		const state = PlayerState.for(player);
		if (!state.getFlag<boolean>(this.OPEN_FLAG)) return;

		// Dimension change ejects the rider naturally; just reset state.
		state.setFlag(this.OPEN_FLAG, false);
		player.playSound('random.enderchestclosed');
		player.onScreenDisplay.setActionBar(this.PAYLOAD_CLOSED);
		ShulkInventory.log.info(`closed on dimension change, for: ${player.name}, id: ${player.id}`);
		// Entity relocation is handled by onTick via the cross-dimension findEntity search.
	}



	//#region INVENTORY

	private open(player: Player): void {
		const entity = this.getOrCreateEntity(player);
		entity.nameTag = 'origins.shulk_inventory';

		const rideable = entity.getComponent(EntityComponentTypes.Rideable);
		if (!rideable?.addRider(player)) {
			ShulkInventory.log.warn(`addRider failed, for: ${player.name}, id: ${entity.id}`);
			return;
		}

		player.playSound('random.enderchestopen');
		player.dimension.spawnParticle(
			'r4isen1920_originspe:shulk_inventory',
			Vec3.from(player.location).add(0, 1.5, 0)
		);

		PlayerState.for(player).setFlag(this.OPEN_FLAG, true);
		ShulkInventory.log.info(`opened, for: ${player.name}, id: ${entity.id}`);

		// delay payload str to avoid being overridden by the riding-start hint string.
		system.runTimeout(() => {
			if (!player.isValid) return;
			player.onScreenDisplay.setActionBar(this.PAYLOAD_OPEN);
		}, 5);
	}

	private close(player: Player): void {
		const entity = this.findEntity(player);
		if (!entity || !entity.isValid) {
			ShulkInventory.log.warn(`close failed, entity not found, for: ${player.name}`);	
			return;
		}

		const rideable = entity.getComponent(EntityComponentTypes.Rideable);
		if (rideable) rideable.ejectRider(player);

		player.onScreenDisplay.setActionBar(this.PAYLOAD_CLOSED);
		player.playSound('random.enderchestclosed');
		player.dimension.spawnParticle(
			'r4isen1920_originspe:player_inventory',
			Vec3.from(player.location).add(0, 1.5, 0)
		);

		PlayerState.for(player).setFlag(this.OPEN_FLAG, false);
		ShulkInventory.log.info(`closed, for: ${player.name}, id: ${entity.id}`);
	}

	private findEntity(player: Player): Entity | undefined {
		// Search player's current dimension first, then fall back to all known dimensions.
		// The entity may still be in the previous dimension right after a dimension change.
		const seen = new Set<string>();
		const dims = [
			player.dimension,
			world.getDimension('overworld'),
			world.getDimension('nether'),
			world.getDimension('the_end'),
		];
		for (const dim of dims) {
			if (seen.has(dim.id)) continue;
			seen.add(dim.id);
			const entity = dim
				.getEntities({ type: this.INV_ENTITY_TYPE })
				.find(e =>
					e.getDynamicProperty(this.OWNER_DP_KEY) === player.id &&
					e.getDynamicProperty(this.IS_SHULK_DP_KEY) === true
				);
			if (entity) return entity;
		}
		return undefined;
	}

	private getOrCreateEntity(player: Player): Entity {
		const existing = this.findEntity(player);
		if (existing) return existing;

		const entity = player.dimension.spawnEntity(this.INV_ENTITY_TYPE, player.location);
		ShulkInventory.log.info(`spawning inventory entity, for: ${player.name}, id: ${entity.id}`);
		entity.setDynamicProperty(this.OWNER_DP_KEY, player.id);
		entity.setDynamicProperty(this.IS_SHULK_DP_KEY, true);
		return entity;
	}

}
