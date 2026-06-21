import {
	EntityHurtAfterEvent,
	EntityHitEntityAfterEvent,
	EntityHealthChangedAfterEvent,
	Player
} from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services/AttributeService';
import { ResourceBarService } from '../../services/ResourceBarService';

const BAR_ID = 25;
const MAX_STACKS = 7;
const BAR_LEVELS: readonly number[] = [0, 15, 29, 43, 57, 71, 85, 100] as const;
const STACKS_FLAG = 'wrathroot_stacks';

@RegisterPower
export class Wrathroot implements Power {
	readonly id = 'wrathroot';
	readonly icon = '25';

	static getStacks(player: Player): number {
		return PlayerState.for(player).getFlag<number>(STACKS_FLAG) ?? 0;
	}

	static setStacks(player: Player, stacks: number, previous: number): void {
		const clamped = Math.min(Math.max(stacks, 0), MAX_STACKS);

		PlayerState.for(player).setFlag(STACKS_FLAG, clamped);

		AttributeService.fireEvent(player, `attack.${Math.max(1, clamped)}`);

		ResourceBarService.push(player, {
			id: BAR_ID,
			from: BAR_LEVELS[previous],
			to: BAR_LEVELS[clamped],
			durationSeconds: 1,
			persist: true
		});
	}

	static addStack(player: Player): void {
		const current = Wrathroot.getStacks(player);
		if (current >= MAX_STACKS) return;
		Wrathroot.setStacks(player, current + 1, current);
	}

	onAcquire(player: Player): void {
		const stacks = Wrathroot.getStacks(player);

		AttributeService.fireEvent(player, `attack.${Math.max(1, stacks)}`);

		ResourceBarService.push(player, {
			id: BAR_ID,
			from: BAR_LEVELS[stacks],
			to: BAR_LEVELS[stacks],
			durationSeconds: 1,
			persist: true
		});
	}

	onRelease(player: Player): void {
		AttributeService.fireEvent(player, 'attack.0');
		ResourceBarService.pop(player, BAR_ID);
		PlayerState.for(player).setFlag(STACKS_FLAG, 0);
	}

	onAttack(player: Player, _ev: EntityHitEntityAfterEvent): void {
		Wrathroot.addStack(player);
	}

	onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
		const target = ev.hurtEntity;
		if (!target.isValid) return;

		const health = target.getComponent('minecraft:health');
		if (!health || health.currentValue > 0) return;

		const current = Wrathroot.getStacks(player);
		if (current <= 0) return;

		Wrathroot.setStacks(player, current - 1, current);
	}

	onHealthChange(player: Player, ev: EntityHealthChangedAfterEvent): void {
		if (ev.newValue > 0) return;

		const current = Wrathroot.getStacks(player);

		ResourceBarService.push(player, {
			id: BAR_ID,
			from: BAR_LEVELS[current],
			to: BAR_LEVELS[0],
			durationSeconds: 1,
			persist: false
		});

		PlayerState.for(player).setFlag(STACKS_FLAG, 0);
		AttributeService.fireEvent(player, 'attack.0');
	}
}
