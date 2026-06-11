import {
	Entity,
	EntityDamageCause,
	EntityHitEntityAfterEvent,
	EntityHurtAfterEvent,
	Player,
	system,
	TicksPerSecond,
	Vector3,
	world
} from '@minecraft/server';

import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';
import { Log } from '../../utils/Log';
import { AfterEntityHurt } from '../../core/DecoratedEvents';
import { Wrathroot } from './Wrathroot';

const log = Log.get('VineBind');

const MAX_CHAIN_LINKS = 4;
const CHAIN_SEARCH_RADIUS = 32;
const CHAIN_PROPAGATION_DELAY = 4;
const VINE_EFFECT_DURATION = TicksPerSecond * 4;
const COOLDOWN_KEY = 'vine_bind_cooldown';
const COOLDOWN_TICKS = TicksPerSecond * 6;
const COOLDOWN_BAR_DELAY = TicksPerSecond * 2.5;

const EXCLUDED_TYPES = new Set([
	'minecraft:agent',
	'minecraft:area_effect_cloud',
	'minecraft:armor_stand',
	'minecraft:arrow',
	'minecraft:boat',
	'minecraft:chest',
	'minecraft:chest_boat',
	'minecraft:chest_minecart',
	'minecraft:command_block_minecart',
	'minecraft:dragon_fireball',
	'minecraft:minecart',
	'minecraft:fireball',
	'minecraft:egg',
	'minecraft:ender_crystal',
	'minecraft:ender_pearl',
	'minecraft:eye_of_ender_signal',
	'minecraft:fireworks_rocket',
	'minecraft:fishing_hook',
	'minecraft:hopper_minecart',
	'minecraft:item',
	'minecraft:lightning_bolt',
	'minecraft:lingering_potion',
	'minecraft:player',
	'minecraft:potion',
	'minecraft:llama_spit',
	'minecraft:npc',
	'minecraft:shulker_bullet',
	'minecraft:snowball',
	'minecraft:small_fireball',
	'minecraft:splash_potion',
	'minecraft:thrown_trident',
	'minecraft:tnt',
	'minecraft:tnt_minecart',
	'minecraft:tripod_camera',
	'minecraft:wither_skull',
	'minecraft:wither_skull_dangerous',
	'minecraft:xp_bottle',
	'minecraft:xp_orb'
]);

const IGNORED_BLOCK_TYPES = new Set([
	'minecraft:bush',
	'minecraft:deadbush',
	'minecraft:firefly_bush',
	'minecraft:sweet_berry_bush',
	'minecraft:short_grass',
	'minecraft:tall_grass',
	'minecraft:short_dry_grass',
	'minecraft:tall_dry_grass',
	'minecraft:seagrass',
	'minecraft:fern',
	'minecraft:large_fern',
	'minecraft:light_block'
]);

interface ChainEntityInfo {
	entity: Entity;
	tagTimeoutId: number;
}

type SpawnVineFn = (
	from: Entity,
	to: Entity,
	isInitialSource: boolean,
	owner: Player
) => Entity | undefined;
type PropagateFn = (source: Entity, ctx: ChainContext, linksMade: number) => void;

interface ChainContext {
	chainOwnerId: string;
	entityInfos: ChainEntityInfo[];
	vineLinkInfos: Array<{ vineEntity: Entity }>;
	spawnVine: SpawnVineFn;
	propagate: PropagateFn;
	startCooldown: (player: Player) => void;
	triggerCollapse: (ctx: ChainContext) => void;
}

@RegisterPower
export class VineBind implements Power {
	readonly id = 'vine_bind';
	readonly icon = '24';

	@AfterEntityHurt()
	static onDamageSpread(ev: EntityHurtAfterEvent): void {
		const { hurtEntity, damage, damageSource } = ev;
		if (!hurtEntity?.isValid || damageSource.cause !== EntityDamageCause.magic) return;

		const tag = hurtEntity.getTags().find((t) => t.startsWith('is_in_active_chain_'));
		if (!tag) return;

		const chained = hurtEntity.dimension.getEntities({ tags: [tag] });
		for (const entity of chained) {
			if (!entity?.isValid || entity.id === hurtEntity.id) continue;
			const spread = Math.floor(damage * 0.25);
			entity.runCommand(`damage @s ${spread} magic`);
			entity.dimension.spawnParticle(
				'r4isen1920_originspe:rootkin_vine_dmg_spread',
				entity.location
			);
		}
	}

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const nowTick = system.currentTick;
		if (PlayerState.for(player).isOnCooldown(COOLDOWN_KEY, nowTick)) return;

		const target = ev.hitEntity;
		const tag = `is_in_active_chain_${player.id}`;

		if (target.hasTag(tag)) return;

		target.addTag(tag);

		const tagTimeoutId = system.runTimeout(
			() => {
				if (target.isValid) target.removeTag(tag);
			},
			VINE_EFFECT_DURATION + MAX_CHAIN_LINKS * CHAIN_PROPAGATION_DELAY + TicksPerSecond
		);

		const spawnVine = VineBind.spawnVine;
		const propagate = VineBind.propagateChain;
		const startCooldown = VineBind.startCooldown;
		const triggerCollapse = VineBind.triggerChainCollapse;

		const ctx: ChainContext = {
			chainOwnerId: player.id,
			entityInfos: [{ entity: target, tagTimeoutId }],
			vineLinkInfos: [],
			spawnVine,
			propagate,
			startCooldown,
			triggerCollapse
		};

		propagate(target, ctx, 0);
	}

	static spawnVine(
		from: Entity,
		to: Entity,
		isInitialSource: boolean,
		owner: Player
	): Entity | undefined {
		const rawFrom = from.location;
		const rawTo = to.location;

		const yOffsetFrom = Math.abs(from.getHeadLocation().y - rawFrom.y) / 2;
		const yOffsetTo = Math.abs(to.getHeadLocation().y - rawTo.y) / 2;

		const locFrom: Vector3 = { x: rawFrom.x, y: rawFrom.y + yOffsetFrom, z: rawFrom.z };
		const locTo: Vector3 = { x: rawTo.x, y: rawTo.y + yOffsetTo, z: rawTo.z };

		const dir: Vector3 = {
			x: locTo.x - locFrom.x,
			y: locTo.y - locFrom.y,
			z: locTo.z - locFrom.z
		};
		const magnitude = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
		const distance = Math.floor(magnitude);

		let adjustedTo: Vector3 = { ...locTo };
		if (magnitude > 0) {
			const unit: Vector3 = {
				x: dir.x / magnitude,
				y: dir.y / magnitude,
				z: dir.z / magnitude
			};
			adjustedTo = {
				x: locFrom.x + unit.x * distance,
				y: locFrom.y + unit.y * distance - yOffsetTo,
				z: locFrom.z + unit.z * distance
			};
		}

		from.runCommand(
			`summon r4isen1920_originspe:vine_bind ${locFrom.x} ${locFrom.y} ${locFrom.z} facing ${locTo.x} ${locTo.y} ${locTo.z}`
		);

		const vineEntity = from.dimension.getEntities({
			type: 'r4isen1920_originspe:vine_bind',
			location: locFrom,
			maxDistance: 1
		})[0];

		log.debug(
			`spawnVine: vineEntity=${vineEntity?.isValid}, locFrom=${JSON.stringify(locFrom)}`
		);
		try {
			from.dimension.playSound('totem_shield.break', locFrom, { volume: 0.5, pitch: 0.5 });
		} catch (e) {
			log.error(`spawnVine playSound (spawn) failed: ${e}`);
		}
		owner.playSound('totem_shield.break', { volume: 0.5, pitch: 0.5 });

		if (!vineEntity) return undefined;

		vineEntity.setProperty('r4isen1920_originspe:length', Math.max(distance - 1, 0));

		if (from.getEffect('minecraft:invisibility')) from.removeEffect('minecraft:invisibility');
		if (to.getEffect('minecraft:invisibility')) to.removeEffect('minecraft:invisibility');

		const count = Math.max(1, distance);
		const step = 1 / count;
		for (let i = 0; i <= 1; i += step) {
			const pos: Vector3 = {
				x: locFrom.x + dir.x * i,
				y: locFrom.y + dir.y * i,
				z: locFrom.z + dir.z * i
			};
			from.dimension.spawnParticle('r4isen1920_originspe:rootkin_vine_spawn', pos);
			system.runTimeout(() => {
				if (!from.isValid) return;
				from.dimension.spawnParticle('r4isen1920_originspe:rootkin_vine_despawn', pos);
			}, VINE_EFFECT_DURATION);
		}

		const lockTick = system.runInterval(() => {
			if (isInitialSource && from.isValid) {
				from.teleport({
					x: locFrom.x,
					y: from.isOnGround ? Math.floor(locFrom.y) : locFrom.y,
					z: locFrom.z
				});
			}
			if (to.isValid) to.teleport(adjustedTo);
		});

		system.runTimeout(() => {
			if (vineEntity.isValid) {
				vineEntity.triggerEvent('r4isen1920_originspe:instant_despawn');
				if (from.isValid) {
					from.dimension.playSound('totem_shield.break', locFrom, {
						volume: 0.5,
						pitch: 1.5
					});
				}
				owner.playSound('totem_shield.break', { volume: 0.5, pitch: 0.5 });
			}
			system.clearRun(lockTick);
		}, VINE_EFFECT_DURATION);

		return vineEntity;
	}

	static triggerChainCollapse(ctx: ChainContext): void {
		system.runTimeout(() => {
			let totalHealth = 0;
			const targets: Entity[] = [];

			for (const { entity } of ctx.entityInfos) {
				if (!entity?.isValid) continue;
				const hp = entity.getComponent('minecraft:health') as any;
				if (hp) totalHealth += hp.currentValue;
				targets.push(entity);
			}

			const damage = totalHealth * 0.12;
			const chainOwner = world.getEntity(ctx.chainOwnerId) as Player | undefined;

			for (const entity of targets) {
				if (!entity.isValid) continue;
				try {
					entity.dimension.spawnParticle(
						'r4isen1920_originspe:rootkin_vine_break',
						entity.location
					);
				} catch {}
				entity.applyDamage(damage, { cause: EntityDamageCause.magic });
				try {
					entity.dimension.playSound('totem_shield.deactivate', entity.location);
				} catch (e) {
					log.error(`triggerChainCollapse playSound failed: ${e}`);
				}
				chainOwner?.playSound('totem_shield.deactivate');
			}
		}, MAX_CHAIN_LINKS * CHAIN_PROPAGATION_DELAY);
	}

	static startCooldown(player: Player): void {
		PlayerState.for(player).setCooldown(COOLDOWN_KEY, system.currentTick, COOLDOWN_TICKS);

		system.runTimeout(() => {
			if (!player.isValid) return;
			ResourceBarService.push(player, {
				id: 24,
				from: 0,
				to: 100,
				durationSeconds: 6,
				persist: false
			});
		}, COOLDOWN_BAR_DELAY);
	}

	static propagateChain(source: Entity, ctx: ChainContext, linksMade: number): void {
		const owner = world.getEntity(ctx.chainOwnerId) as Player | undefined;
		if (!owner?.isValid) return;

		if (linksMade >= MAX_CHAIN_LINKS) {
			ctx.triggerCollapse(ctx); // Deals the 12% total health damage
			ctx.startCooldown(owner);

			// Adds 1 Wrathroot stack
			const state = PlayerState.for(owner);
			if (state.hasPower('wrathroot')) {
				Wrathroot.addStack(owner);
			}
			return;
		}

		system.runTimeout(() => {
			if (!source.isValid) return;

			const tag = `is_in_active_chain_${ctx.chainOwnerId}`;
			const excluded = new Set(ctx.entityInfos.map((ei) => ei.entity.id));

			const candidates = source.dimension
				.getEntities({
					location: source.location,
					maxDistance: CHAIN_SEARCH_RADIUS,
					excludeFamilies: ['vine_bind', 'projectile', 'inanimate'],
					excludeTags: [tag]
				})
				.filter((e) => {
					if (!e.isValid || e.id === source.id || excluded.has(e.id)) return false;
					if (EXCLUDED_TYPES.has(e.typeId)) return false;

					const headRaw = source.getHeadLocation();
					const headPos: Vector3 = { x: headRaw.x, y: headRaw.y + 1, z: headRaw.z };
					const targetPos = e.location;
					const dir: Vector3 = {
						x: targetPos.x - headPos.x,
						y: targetPos.y - headPos.y,
						z: targetPos.z - headPos.z
					};
					const dist = Math.sqrt(dir.x ** 2 + dir.y ** 2 + dir.z ** 2);
					if (dist <= 0) return true;

					const hit = source.dimension.getBlockFromRay(headPos, dir, {
						maxDistance: dist,
						includeLiquidBlocks: true,
						includePassableBlocks: false
					});
					return !hit || IGNORED_BLOCK_TYPES.has((hit as any).typeId);
				});

			let nearest: Entity | null = null;
			let minDistSq = Infinity;
			const sl = source.location;

			for (const e of candidates) {
				const el = e.location;
				const distSq = (sl.x - el.x) ** 2 + (sl.y - el.y) ** 2 + (sl.z - el.z) ** 2;
				if (distSq < minDistSq) {
					minDistSq = distSq;
					nearest = e;
				}
			}

			if (!nearest?.isValid) {
				ctx.startCooldown(owner!);
				return;
			}

			const target = nearest;
			target.addTag(tag);

			const timeoutId = system.runTimeout(() => {
				if (target.isValid) target.removeTag(tag);
			}, VINE_EFFECT_DURATION + CHAIN_PROPAGATION_DELAY);

			ctx.entityInfos.push({ entity: target, tagTimeoutId: timeoutId });

			const vine = ctx.spawnVine(source, target, linksMade === 0, owner!);
			if (vine) ctx.vineLinkInfos.push({ vineEntity: vine });

			ctx.propagate(target, ctx, linksMade + 1);
		}, CHAIN_PROPAGATION_DELAY);
	}
}
