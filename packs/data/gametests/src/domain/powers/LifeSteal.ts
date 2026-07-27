import { Player, EntityHurtAfterEvent, EntityComponentTypes, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

const MAX_STACKS = 3;
const HEAL_PER_STACK = 0.005;
const STACK_DURATION_TICKS = 100;
const STACK_KEY = 'life_steal:stacks';
const LAST_HIT_KEY = 'life_steal:last_hit_tick';

const lastStackTick = new Map<string, number>();

@RegisterPower
export class LifeSteal implements Power {
	readonly id = 'life_steal';

	onAcquire(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag(STACK_KEY, 0);
		state.setFlag(LAST_HIT_KEY, 0);
		lastStackTick.delete(player.id);
	}

	onRelease(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag(STACK_KEY, 0);
		state.setFlag(LAST_HIT_KEY, 0);
		lastStackTick.delete(player.id);
	}

	onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
		const target = ev.hurtEntity;

		if (target instanceof Player) return;

		const targetHealth = target.getComponent(EntityComponentTypes.Health);
		if (!targetHealth) return;

		const currentTick = system.currentTick;

		if (lastStackTick.get(player.id) === currentTick) return;
		lastStackTick.set(player.id, currentTick);

		const state = PlayerState.for(player);
		const lastHitTick = state.getFlag<number>(LAST_HIT_KEY) ?? 0;
		const currentStacks = state.getFlag<number>(STACK_KEY) ?? 0;
		const decayedStacks = currentTick - lastHitTick > STACK_DURATION_TICKS ? 0 : currentStacks;
		const newStacks = Math.min(decayedStacks + 1, MAX_STACKS);

		state.setFlag(STACK_KEY, newStacks);
		state.setFlag(LAST_HIT_KEY, currentTick);

		const healthComp = player.getComponent(EntityComponentTypes.Health);
		if (!healthComp) return;

		const maxHp = healthComp.effectiveMax;
		const currentHp = healthComp.currentValue;
		const missingHp = maxHp - currentHp;

		if (missingHp <= 0) return;

		const healAmount = missingHp * (newStacks * HEAL_PER_STACK);
		healthComp.setCurrentValue(Math.min(currentHp + healAmount, maxHp));
	}
}
