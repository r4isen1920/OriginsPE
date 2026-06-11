import { Player, EntityHealthComponent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';

const BAR_FULL = 100;
const BAR_TWO_THIRDS = 71;
const BAR_ONE_THIRD = 29;

const HEALTH_THRESHOLDS: Record<number, { triggerBelow: number; nextLevel: number }> = {
	3: { triggerBelow: 20, nextLevel: 2 },
	2: { triggerBelow: 10, nextLevel: 1 }
};

@RegisterPower
export class Fragmentation implements Power {
	readonly id = 'fragmentation';
	readonly icon = '08';
	readonly tickInterval = 3;

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state) return;

		if (!state.hasPower('fragmentation')) {
			state.setFlag('fragmentation_level', undefined);
			state.setFlag('previous_fragmentation_level', undefined);
			state.setFlag('last_rendered_level', undefined);
			ResourceBarService.pop(player, 8);
			return;
		}

		const healthComponent = player.getComponent('minecraft:health') as EntityHealthComponent;
		if (!healthComponent) return;

		const playerHealth = healthComponent.currentValue;
		let fragmentationLevel = state.getFlag<number>('fragmentation_level') ?? 0;

		if (fragmentationLevel === 0) {
			this.changeFragmentationLevel(player, state, 3, null);
			return;
		}

		const threshold = HEALTH_THRESHOLDS[fragmentationLevel];
		if (
			threshold &&
			playerHealth < threshold.triggerBelow &&
			!state.getFlag<boolean>('slime_ball_consumed')
		) {
			this.changeFragmentationLevel(player, state, threshold.nextLevel, fragmentationLevel);
			return;
		}

		const previousLevel = state.getFlag<number>('previous_fragmentation_level');
		const lastRendered = state.getFlag<number>('last_rendered_level');

		if (previousLevel !== undefined || fragmentationLevel !== lastRendered) {
			this.applyFragmentationLevel(player, state, fragmentationLevel);
			state.setFlag('last_rendered_level', fragmentationLevel);
		}
	}

	private changeFragmentationLevel(
		player: Player,
		state: PlayerState,
		newLevel: number,
		previousLevel: number | null
	): void {
		if (previousLevel !== null) state.setFlag('previous_fragmentation_level', previousLevel);
		state.setFlag('fragmentation_level', newLevel);
		this.applyFragmentationLevel(player, state, newLevel);
	}

	private applyFragmentationLevel(player: Player, state: PlayerState, level: number): void {
		const previousLevel = state.getFlag<number>('previous_fragmentation_level') ?? null;

		switch (level) {
			case 3:
				player.triggerEvent('r4isen1920_originspe:health.40');
				player.triggerEvent('r4isen1920_originspe:scale.1.25');

				if (previousLevel === 2) {
					this.onIncrementFragmentationLevel(player, state, 3);
					break;
				}

				ResourceBarService.push(player, {
					id: 8,
					from: BAR_FULL,
					to: BAR_FULL,
					durationSeconds: 5,
					persist: false
				});
				break;

			case 2:
				player.triggerEvent('r4isen1920_originspe:health.20');
				player.triggerEvent('r4isen1920_originspe:scale.1');

				if (previousLevel === 3) {
					this.onDecrementFragmentationLevel(player, state, 2);
					break;
				} else if (previousLevel === 1) {
					this.onIncrementFragmentationLevel(player, state, 2);
					break;
				}

				ResourceBarService.push(player, {
					id: 8,
					from: BAR_TWO_THIRDS,
					to: BAR_TWO_THIRDS,
					durationSeconds: 5,
					persist: false
				});
				break;

			case 1:
				player.triggerEvent('r4isen1920_originspe:health.10');
				player.triggerEvent('r4isen1920_originspe:scale.0.5');

				if (previousLevel === 2) {
					this.onDecrementFragmentationLevel(player, state, 1);
					break;
				}

				ResourceBarService.push(player, {
					id: 8,
					from: BAR_ONE_THIRD,
					to: BAR_ONE_THIRD,
					durationSeconds: 5,
					persist: false
				});
				break;
		}
	}

	private onIncrementFragmentationLevel(player: Player, state: PlayerState, level: number): void {
		state.setFlag('previous_fragmentation_level', undefined);

		const health = player.getComponent('minecraft:health') as EntityHealthComponent;
		if (health) health.resetToMaxValue();

		switch (level) {
			case 2:
				ResourceBarService.push(player, {
					id: 8,
					from: BAR_ONE_THIRD,
					to: BAR_TWO_THIRDS,
					durationSeconds: 5,
					persist: false
				});
				break;
			case 3:
				ResourceBarService.push(player, {
					id: 8,
					from: BAR_TWO_THIRDS,
					to: BAR_FULL,
					durationSeconds: 5,
					persist: false
				});
				break;
		}
	}

	private onDecrementFragmentationLevel(player: Player, state: PlayerState, level: number): void {
		state.setFlag('previous_fragmentation_level', undefined);

		const health = player.getComponent('minecraft:health') as EntityHealthComponent;
		if (health) health.resetToMaxValue();

		switch (level) {
			case 1:
				ResourceBarService.push(player, {
					id: 8,
					from: BAR_TWO_THIRDS,
					to: BAR_ONE_THIRD,
					durationSeconds: 5,
					persist: false
				});
				break;
			case 2:
				ResourceBarService.push(player, {
					id: 8,
					from: BAR_FULL,
					to: BAR_TWO_THIRDS,
					durationSeconds: 5,
					persist: false
				});
				break;
		}
	}
}
