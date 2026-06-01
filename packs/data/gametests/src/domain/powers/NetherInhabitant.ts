import { Player, world, TicksPerSecond, system, Dimension, Vector3 } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class NetherInhabitant implements Power {
	readonly id = 'nether_inhabitant';
	private static readonly log = Log.get('Nether_inhabitant');

	constructor() {
		world.afterEvents.playerDimensionChange.subscribe((event) => {
			try {
				const { toDimension, player } = event;
				const state = PlayerState.for(player);

				if (!state.hasPower('nether_inhabitant')) return;
				if (
					state.getFlag<boolean>('nether_spawn_check') !== true ||
					toDimension.id !== 'minecraft:nether'
				) return;

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

					NetherInhabitant.createObsidianPlatform(
						player.dimension,
						dummyEntity.location
					);

					player.teleport(dummyEntity.location);

					player.removeEffect('resistance');
					state.setFlag('nether_spawn_check', false);
					state.setFlag('nether_spawned', true);
				});
			} catch (error: any) {
				NetherInhabitant.log.error(
					`Error inside playerDimensionChange: ${error?.stack ?? error}`
				);
			}
		});
	}

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);

			if (!state.hasPower('nether_inhabitant')) {
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
			) return;

			const netherDimension = world.getDimension('minecraft:nether');

			player.addEffect('resistance', TicksPerSecond * 10, {
				amplifier: 255,
				showParticles: false
			});
			player.teleport(player.location, { dimension: netherDimension });

			state.setFlag('nether_spawn_check', true);
		} catch (error: any) {
			NetherInhabitant.log.error(
				`Error inside Nether_inhabitant ticker: ${error?.stack ?? error}`
			);
		}
	}

	private static createObsidianPlatform(dimension: Dimension, location: Vector3): void {
		const platformSize = 2;

		for (let x = -platformSize; x <= platformSize; x++) {
			for (let z = -platformSize; z <= platformSize; z++) {
				const blockLoc = {
					x: Math.floor(location.x) + x,
					y: Math.floor(location.y) - 1,
					z: Math.floor(location.z) + z
				};
				dimension.runCommand(`setblock ${blockLoc.x} ${blockLoc.y} ${blockLoc.z} obsidian`);
			}
		}

		for (let x = -1; x <= 1; x++) {
			for (let y = 0; y <= 2; y++) {
				for (let z = -1; z <= 1; z++) {
					const airLoc = {
						x: Math.floor(location.x) + x,
						y: Math.floor(location.y) + y,
						z: Math.floor(location.z) + z
					};
					dimension.runCommand(`setblock ${airLoc.x} ${airLoc.y} ${airLoc.z} air`);
				}
			}
		}

		const chestLoc = {
			x: Math.floor(location.x),
			y: Math.floor(location.y),
			z: Math.floor(location.z) + 2
		};

		dimension.runCommand(`setblock ${chestLoc.x} ${chestLoc.y} ${chestLoc.z} chest`);
		dimension.runCommand(
			`replaceitem block ${chestLoc.x} ${chestLoc.y} ${chestLoc.z} slot.container 0 netherrack 32`
		);
		dimension.runCommand(
			`replaceitem block ${chestLoc.x} ${chestLoc.y} ${chestLoc.z} slot.container 1 stone_pickaxe 1`
		);
	}
}