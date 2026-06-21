import { Player, GameMode } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerState } from '../../core/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';

@RegisterPower
export class Phantomize implements Power {
	readonly id = 'phantomize';
	readonly tickInterval = 1;

	readonly active = {
		icon: '05',
		name: 'origins.trait.phantomize.name'
	};

	private static readonly BAR_ID = 5;

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		if (!state) return;

		const isPhantom = state.getFlag<boolean>('is_phantomized') ?? false;
		if (isPhantom) return;

		state.setFlag('is_phantomized', true);
		player.setGameMode(GameMode.Spectator);

		const loc = player.location;
		state.setFlag('phantom_last_x', loc.x);
		state.setFlag('phantom_last_z', loc.z);
		state.setFlag('phantom_still_ticks', 0);

		ResourceBarService.push(player, {
			id: Phantomize.BAR_ID,
			durationSeconds: -1
		});
	}

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('phantomize')) return;

		const isPhantom = state.getFlag<boolean>('is_phantomized') ?? false;
		if (!isPhantom) return;

		const currentLoc = player.location;
		const lastX = state.getFlag<number>('phantom_last_x') ?? currentLoc.x;
		const lastZ = state.getFlag<number>('phantom_last_z') ?? currentLoc.z;

		const distanceMoved = Math.sqrt(
			Math.pow(currentLoc.x - lastX, 2) + Math.pow(currentLoc.z - lastZ, 2)
		);

		state.setFlag('phantom_last_x', currentLoc.x);
		state.setFlag('phantom_last_z', currentLoc.z);

		let stillTicks = state.getFlag<number>('phantom_still_ticks') ?? 0;

		if (distanceMoved < 0.01) {
			stillTicks++;
		} else {
			stillTicks = 0;
		}

		if (stillTicks >= 20) {
			state.setFlag('is_phantomized', false);
			state.setFlag('phantom_still_ticks', 0);
			player.setGameMode(GameMode.Survival);

			ResourceBarService.push(player, {
				id: Phantomize.BAR_ID,
				durationSeconds: 0
			});
			return;
		}

		state.setFlag('phantom_still_ticks', stillTicks);
	}
}
