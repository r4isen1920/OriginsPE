import {
	Entity,
	EntityDamageCause,
	EntityHitEntityAfterEvent,
	Player,
	system,
	TicksPerSecond
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';

const STUN_CHANCE = 0.3; //30 percent
const STUN_MIN_TICKS = TicksPerSecond * 1; //1sec
const STUN_MAX_TICKS = TicksPerSecond * 2; //2secs

const METALLIC_ITEM_TYPES = new Set([
	//irons
	'minecraft:raw_iron',
	'minecraft:iron_ingot',
	'minecraft:iron_nugget',
	'minecraft:iron_block',
	'minecraft:iron_sword',
	'minecraft:iron_pickaxe',
	'minecraft:iron_axe',
	'minecraft:iron_shovel',
	'minecraft:iron_hoe',
	'minecraft:iron_helmet',
	'minecraft:iron_chestplate',
	'minecraft:iron_leggings',
	'minecraft:iron_boots',
	'minecraft:iron_horse_armor',

	//golds
	'minecraft:raw_gold',
	'minecraft:gold_ingot',
	'minecraft:gold_nugget',
	'minecraft:gold_block',
	'minecraft:golden_sword',
	'minecraft:golden_pickaxe',
	'minecraft:golden_axe',
	'minecraft:golden_shovel',
	'minecraft:golden_hoe',
	'minecraft:golden_helmet',
	'minecraft:golden_chestplate',
	'minecraft:golden_leggings',
	'minecraft:golden_boots',
	'minecraft:golden_horse_armor',

	//netherite
	'minecraft:netherite_scrap',
	'minecraft:netherite_ingot',
	'minecraft:netherite_sword',
	'minecraft:netherite_pickaxe',
	'minecraft:netherite_axe',
	'minecraft:netherite_shovel',
	'minecraft:netherite_hoe',
	'minecraft:netherite_helmet',
	'minecraft:netherite_chestplate',
	'minecraft:netherite_leggings',
	'minecraft:netherite_boots',

	//copper
	'minecraft:raw_copper',
	'minecraft:copper_ingot',
	'minecraft:copper_block',

	//chains
	'minecraft:chain_helmet',
	'minecraft:chain_chestplate',
	'minecraft:chain_leggings',
	'minecraft:chain_boots',

	//shield
	'minecraft:shield',

	//others
	'minecraft:bucket',
	'minecraft:shears',
	'minecraft:flint_and_steel'
]);

@RegisterPower
export class Discharge implements Power {
	readonly id = 'discharge';

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const target = ev.hitEntity;
		if (!target?.isValid) return;

		const slowness = target.getEffect('slowness');
		if (!slowness) return;

		if (Math.random() >= STUN_CHANCE) return;

		const stunDuration = Math.floor(
			STUN_MIN_TICKS + Math.random() * (STUN_MAX_TICKS - STUN_MIN_TICKS)
		);

		Discharge.applyStun(target, stunDuration, player);
	}

	private static applyStun(target: Entity, durationTicks: number, owner: Player): void {
		const lockLocation = { ...target.location };

		target.dimension.spawnParticle('r4isen1920_originspe:electric_zap', {
			x: lockLocation.x,
			y: lockLocation.y + 1,
			z: lockLocation.z
		});

		const lockTick = system.runInterval(() => {
			if (!target.isValid) {
				system.clearRun(lockTick);
				return;
			}
			target.teleport(lockLocation);
		});

		system.runTimeout(() => {
			system.clearRun(lockTick);
		}, durationTicks);

		Discharge.applyMetallicDamage(target, owner);
	}

	private static applyMetallicDamage(target: Entity, owner: Player): void {
		const inventory = target.getComponent('minecraft:inventory');
		if (!inventory?.container) {
			return;
		}

		const container = inventory.container;
		const uniqueMetallicTypes = new Set<String>();

		for (let i = 0; i < container.size; i++) {
			const stack = container.getItem(i);
			if (!stack) continue;
			if (METALLIC_ITEM_TYPES.has(stack.typeId)) {
				uniqueMetallicTypes.add(stack.typeId);
			}
		}

		const bonusDamage = Math.floor(uniqueMetallicTypes.size / 1);
		if (bonusDamage <= 0) {
			return;
		}

		system.runTimeout(() => {
			if (!target.isValid) return;

			target.applyDamage(bonusDamage, {
				cause: EntityDamageCause.magic,
				damagingEntity: owner
			});
		}, 1);
	}
}
