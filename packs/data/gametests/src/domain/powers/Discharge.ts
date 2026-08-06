import {
	Entity,
	EntityComponentTypes,
	EntityDamageCause,
	EntityHitEntityAfterEvent,
	MolangVariableMap,
	Player,
	system
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { EntityUtils } from '../../utils/EntityUtils';
import { MinecraftEffectTypes, MinecraftItemTypes } from '@minecraft/vanilla-data';
import { Log } from '../../utils';
import { Particles } from '../../Files';



@RegisterPower
export class Discharge implements Power {
	readonly id = 'discharge';

	private static readonly log = Log.get('Discharge');

	private static readonly STUN_CHANCE = 0.3;
	private static readonly STUN_DURATION_TICKS = [20, 30];
	private static readonly DMG_MULT = 1;

	private static readonly METALLIC_ITEM_TYPES: Set<string> = new Set([
		//irons
		MinecraftItemTypes.RawIron,
		MinecraftItemTypes.IronIngot,
		MinecraftItemTypes.IronNugget,
		MinecraftItemTypes.IronBlock,
		MinecraftItemTypes.IronSword,
		MinecraftItemTypes.IronPickaxe,
		MinecraftItemTypes.IronAxe,
		MinecraftItemTypes.IronShovel,
		MinecraftItemTypes.IronHoe,
		MinecraftItemTypes.IronHelmet,
		MinecraftItemTypes.IronChestplate,
		MinecraftItemTypes.IronLeggings,
		MinecraftItemTypes.IronBoots,
		MinecraftItemTypes.IronHorseArmor,

		//golds
		MinecraftItemTypes.RawGold,
		MinecraftItemTypes.GoldIngot,
		MinecraftItemTypes.GoldNugget,
		MinecraftItemTypes.GoldBlock,
		MinecraftItemTypes.GoldenSword,
		MinecraftItemTypes.GoldenPickaxe,
		MinecraftItemTypes.GoldenAxe,
		MinecraftItemTypes.GoldenShovel,
		MinecraftItemTypes.GoldenHoe,
		MinecraftItemTypes.GoldenHelmet,
		MinecraftItemTypes.GoldenChestplate,
		MinecraftItemTypes.GoldenLeggings,
		MinecraftItemTypes.GoldenBoots,
		MinecraftItemTypes.GoldenHorseArmor,

		//netherite
		MinecraftItemTypes.NetheriteScrap,
		MinecraftItemTypes.NetheriteIngot,
		MinecraftItemTypes.NetheriteSword,
		MinecraftItemTypes.NetheritePickaxe,
		MinecraftItemTypes.NetheriteAxe,
		MinecraftItemTypes.NetheriteShovel,
		MinecraftItemTypes.NetheriteHoe,
		MinecraftItemTypes.NetheriteHelmet,
		MinecraftItemTypes.NetheriteChestplate,
		MinecraftItemTypes.NetheriteLeggings,
		MinecraftItemTypes.NetheriteBoots,

		//copper
		MinecraftItemTypes.RawCopper,
		MinecraftItemTypes.CopperIngot,
		MinecraftItemTypes.CopperBlock,

		//chains
		MinecraftItemTypes.ChainmailHelmet,
		MinecraftItemTypes.ChainmailChestplate,
		MinecraftItemTypes.ChainmailLeggings,
		MinecraftItemTypes.ChainmailBoots,

		//shield
		MinecraftItemTypes.Shield,

		//others
		MinecraftItemTypes.Bucket,
		MinecraftItemTypes.Shears,
		MinecraftItemTypes.FlintAndSteel
	]);

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const target = ev.hitEntity;
		if (!target?.isValid) return;

		const slowness = target.getEffect(MinecraftEffectTypes.Slowness);
		if (!slowness) return;

		if (Math.random() < Discharge.STUN_CHANCE) return;

		const stunDuration = Math.floor(
			Discharge.STUN_DURATION_TICKS[0] +
				Math.random() *
					(Discharge.STUN_DURATION_TICKS[1] - Discharge.STUN_DURATION_TICKS[0])
		);

		Discharge.applyStun(target, stunDuration, player);
	}

	private static applyStun(target: Entity, durationTicks: number, owner: Player): void {
		const lockLocation = { ...target.location };

		const molang = new MolangVariableMap();
		const aabb = target.getAABB();
		molang.setVector3('size', aabb.extent);
		molang.setFloat('duration', durationTicks / 20);
		target.dimension.spawnParticle(Particles.ElectricStunned, target.location, molang);

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
		const loc = target.location;
		const dim = target.dimension;

		const inventory = EntityUtils.getComponent(owner, EntityComponentTypes.Inventory);
		const container = inventory?.container;

		const uniqueMetallicTypes = new Set<string>();
		if (container) { 
			for (let i = 0; i < container.size; i++) {
				const stack = container.getItem(i);
				if (!stack) continue;
				if (Discharge.METALLIC_ITEM_TYPES.has(stack.typeId)) {
					uniqueMetallicTypes.add(stack.typeId);
				}
			}
		}

		const bonusDamage = this.DMG_MULT * Math.floor(uniqueMetallicTypes.size / 2);
		if (bonusDamage <= 0) {
			return;
		}

		const molang = new MolangVariableMap();
		const aabb = target.getAABB();
		molang.setVector3('size', aabb.extent);
		molang.setFloat('count', bonusDamage);
		dim.spawnParticle(Particles.ElectricDischarge, loc, molang);
		dim.playSound('item.trident.return', loc, {
			pitch: 1.3
		});

		system.runTimeout(() => {
			if (!target.isValid) return;

			target.applyDamage(bonusDamage, {
				cause: EntityDamageCause.lightning,
				damagingEntity: owner
			});
			this.log.info(`Applied bonus damage: ${bonusDamage} HP, to: ${target.typeId}`)
		}, 1);
	}
}
