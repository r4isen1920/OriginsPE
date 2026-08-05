import { Block, EntityDamageCause, EntityHurtBeforeEvent, Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { Log } from '../../utils/Log';



@RegisterPower
export class Climbing implements Power {
	private static readonly log = Log.get('Climbing');

	readonly id = 'climbing';
	readonly tickInterval = 1;


	//#region SOLIDITY

	private static readonly NON_SOLID_TAGS: readonly string[] = ['plant', 'crop'];

	private static readonly NON_SOLID_KEYWORDS: readonly string[] = [
		'vine', 'seagrass', 'kelp', 'sea_pickle', 'coral_fan', 'sprouts', 'lichen',
		'sculk_vein', 'dripleaf', 'sapling', 'mushroom', 'fungus', 'nether_wart',
		'chorus', 'deadbush', 'dead_bush', 'short_grass', 'fern', 'hanging_roots',
		'spore_blossom', 'pointed_dripstone', 'amethyst_bud', 'amethyst_cluster',
		'tulip', 'orchid', 'allium', 'poppy', 'dandelion', 'azure_bluet', 'oxeye_daisy',
		'cornflower', 'lily_of_the_valley', 'lily_pad', 'waterlily', 'wither_rose',
		'flower', 'petals', 'sugar_cane', 'reeds', 'cactus', 'ladder', 'scaffolding',
		'web', 'snow_layer', 'carpet', 'banner', 'sign', 'skull', 'button', 'lever',
		'tripwire', 'pressure_plate', 'rail', 'torch', 'candle', 'lantern', 'chain', 'end_rod'
	];

	private static readonly SOLID_EXCEPTIONS: ReadonlySet<string> = new Set([
		'dried_kelp_block',
		'nether_wart_block',
		'warped_wart_block',
		'mushroom_stem',
		'red_mushroom_block',
		'brown_mushroom_block'
	]);

	/** Whether the player can grip and climb the given block. */
	private static isClimbable(block: Block | undefined): boolean {
		if (!block || !block.isValid || block.isAir || block.isLiquid) return false;

		try {
			for (const tag of Climbing.NON_SOLID_TAGS) {
				if (block.hasTag(tag)) return false;
			}
		} catch {
			return false;
		}

		const id = block.typeId.replace('minecraft:', '');
		if (Climbing.SOLID_EXCEPTIONS.has(id)) return true;
		return !Climbing.NON_SOLID_KEYWORDS.some((keyword) => id.includes(keyword));
	}


	//#region CLIMB

	/** Probes the wall the player is horizontally facing, at feet and head height. */
	private static probeWall(player: Player):
		{ feet: boolean; head: boolean; fx: number; fz: number } | undefined {
		const view = player.getViewDirection();
		const len = Math.hypot(view.x, view.z);
		if (len < 0.0001) return undefined;

		const fx = view.x / len;
		const fz = view.z / len;

		// The 0.6 offset reaches into the neighbouring column regardless of exact aim/pitch.
		const loc = player.location;
		const probe = 0.6;
		const dim = player.dimension;

		let feet = false;
		let head = false;
		try {
			feet = Climbing.isClimbable(
				dim.getBlock({ x: loc.x + fx * probe, y: loc.y + 0.2, z: loc.z + fz * probe })
			);
			head = Climbing.isClimbable(
				dim.getBlock({ x: loc.x + fx * probe, y: loc.y + 1.2, z: loc.z + fz * probe })
			);
		} catch (e) {
			Climbing.log.debug(`Wall probe failed for ${player.name}: ${e}`);
			return undefined;
		}

		if (!feet && !head) return undefined;
		return { feet, head, fx, fz };
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);
		if (!state.hasPower('climbing')) return;

		const ascending = player.isJumping;
		const descending = player.isSneaking;
		if (!ascending && !descending) return;

		const wall = Climbing.probeWall(player);
		if (!wall) return;

		// Small inward nudge keeps the player hugging the wall instead of drifting off.
		const inward = 0.05;

		if (descending && !ascending) {
			player.clearVelocity();
			player.applyImpulse({ x: wall.fx * inward, y: -0.1, z: wall.fz * inward });
			return;
		}

		if (wall.head) {
			player.clearVelocity();
			player.applyImpulse({ x: wall.fx * inward, y: 0.2, z: wall.fz * inward });
		} else if (wall.feet) {
			player.clearVelocity();
			player.applyImpulse({ x: wall.fx * 0.167, y: 0.27, z: wall.fz * 0.167 });
		}
	}


	//#region DAMAGE

	onHurtBefore(player: Player, ev: EntityHurtBeforeEvent): void {
		if (ev.damageSource.cause === EntityDamageCause.fall) {
			ev.damage *= 0.01;
			Climbing.log.debug(`Reduced fall damage for ${player.name}`);
		}
	}
}
