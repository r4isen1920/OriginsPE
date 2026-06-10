import {
	Player,
	world,
	TicksPerSecond,
	system,
	Dimension,
	Vector3,
	PlayerDimensionChangeAfterEvent
} from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { AfterPlayerDimensionChange } from '../../core/DecoratedEvents';

@RegisterPower
export class NetherInhabitant implements Power {
	readonly id = 'nether_spawn';

	@AfterPlayerDimensionChange
	static onDimensionChange(event: PlayerDimensionChangeAfterEvent): void {
		const { toDimension, player } = event;
		const state = PlayerState.for(player);

		if (!state.hasPower('nether_spawn')) return;

		if (
			state.getFlag<boolean>('nether_spawn_check') !== true ||
			toDimension.id !== 'minecraft:nether'
		)
			return;

		system.run(() => {
			let dummyEntity = player.dimension.getEntities({
				location: player.location,
				minDistance: 3,
				maxDistance: 64,
				closest: 1,
				excludeFamilies: ['player', 'inanimate']
			})[0];

			if (!dummyEntity) {
				dummyEntity = player.dimension.spawnEntity(
					'r4isen1920_originspe:safe_teleporter',
					player.location
				);
			}

			NetherInhabitant.createObsidianPlatform(player.dimension, dummyEntity.location);

			player.teleport(dummyEntity.location);
			player.removeEffect('resistance');

			state.setFlag('nether_spawn_check', false);
			state.setFlag('nether_spawned', true);
		});
	}

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		const state = PlayerState.for(player);

		if (!state.hasPower('nether_spawn')) {
			if (
				state.getFlag<boolean>('nether_spawned') === true ||
				state.getFlag<boolean>('nether_spawn_check') === true
			) {
				state.setFlag('nether_spawned', false);
				state.setFlag('nether_spawn_check', false);
			}
			return;
		}

		if (
			state.getFlag<boolean>('nether_spawn_check') === true ||
			state.getFlag<boolean>('nether_spawned') === true
		)
			return;

		const netherDimension = world.getDimension('minecraft:nether');

		player.addEffect('resistance', TicksPerSecond * 10, {
			amplifier: 255,
			showParticles: false
		});

		player.teleport(player.location, { dimension: netherDimension });

		state.setFlag('nether_spawn_check', true);
	}

	private static createObsidianPlatform(dimension: Dimension, location: Vector3): void {
		const base = {
			x: Math.floor(location.x),
			y: Math.floor(location.y),
			z: Math.floor(location.z)
		};

		dimension.runCommand(
			`fill ${base.x - 2} ${base.y - 1} ${base.z - 2} ${base.x + 2} ${base.y - 1} ${base.z + 2} obsidian`
		);
		dimension.runCommand(
			`fill ${base.x - 1} ${base.y} ${base.z - 1} ${base.x + 1} ${base.y + 2} ${base.z + 1} air`
		);

		const chestZ = base.z + 2;
		dimension.runCommand(`setblock ${base.x} ${base.y} ${chestZ} chest`);
		dimension.runCommand(
			`replaceitem block ${base.x} ${base.y} ${chestZ} slot.container 0 netherrack 32`
		);
		dimension.runCommand(
			`replaceitem block ${base.x} ${base.y} ${chestZ} slot.container 1 stone_pickaxe 1`
		);
	}
}
