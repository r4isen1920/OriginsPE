import {
	Player,
	Entity,
	EntityHitEntityAfterEvent,
	EntityComponentTypes,
	system,
	world
} from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core';

const BLEED_EXPIRY_KEY = 'rapture:bleed_expiry_tick';
const BLEED_DURATION_TICKS = 60;
const BLEED_DAMAGE = 0.5;
const BLEED_PARTICLE = 'r4isen1920_originspe:bleeding';
const HURT_FLASH_INTERVAL = 20;

system.runInterval(() => {
	Rapture.tickAllBleeding();
}, 4);

@RegisterPower
export class Rapture implements Power {
	readonly id = 'rapture';

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const state = PlayerState.for(player);
		if (!state.hasPower('rapture')) return;

		const target = ev.hitEntity;
		if (!target?.isValid) return;
		if (!target.getComponent(EntityComponentTypes.Health)) return;

		const expiryTick = system.currentTick + BLEED_DURATION_TICKS;
		target.setDynamicProperty(BLEED_EXPIRY_KEY, expiryTick);
	}

	static tickAllBleeding(): void {
		const currentTick = system.currentTick;

		for (const dimId of ['minecraft:overworld', 'minecraft:nether', 'minecraft:the_end']) {
			let dimension;
			try {
				dimension = world.getDimension(dimId);
			} catch {
				continue;
			}

			const allEntities = dimension.getEntities();
			const bleeding = allEntities.filter(
				(e) => (e.getDynamicProperty(BLEED_EXPIRY_KEY) as number | undefined) !== undefined
			);

			for (const entity of bleeding) {
				if (!entity.isValid) continue;

				const expiryTick = entity.getDynamicProperty(BLEED_EXPIRY_KEY) as
					| number
					| undefined;
				if (expiryTick === undefined) continue;

				if (currentTick >= expiryTick) {
					entity.setDynamicProperty(BLEED_EXPIRY_KEY, 0);
					continue;
				}

				const healthComp = entity.getComponent(EntityComponentTypes.Health);
				if (!healthComp) continue;

				const newHp = Math.max(healthComp.currentValue - BLEED_DAMAGE, 0);
				healthComp.setCurrentValue(newHp);

				entity.dimension.spawnParticle(BLEED_PARTICLE, entity.location);

				if (currentTick % HURT_FLASH_INTERVAL === 0) {
					entity.applyDamage(0.5);
				}
			}
		}
	}
}
