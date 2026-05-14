import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
/**
 * The player must be an altitude of atleast 151 blocks,
 * when sleeping , to breathe fresh air.
 */
@RegisterPower
export class Fresh_air implements Power {
	readonly id = 'fresh_air';
	private static readonly MIN_ALTITUDE = 151;

	@PlayerTick(20)
	static onPlayerTick(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getOrigin() !== 'avian') return;

		const currentY = Math.floor(player.location.y);
		const isSleeping = player.isSleeping;

		if (isSleeping && currentY < Fresh_air.MIN_ALTITUDE) {
			this.wakeUpPlayer(player);
		}
	}

	private static wakeUpPlayer(player: Player): void {
		const { x, y, z } = player.location;

		player.teleport({ x, y: y + 0.1, z });

		player.onScreenDisplay.setActionBar('§cThe air is too thin! Sleep above Y=150.');
		player.playSound('note.bass');
	}
}
