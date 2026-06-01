import { Player } from '@minecraft/server';
import { Power } from '../Ability';
import { RegisterPower } from '../Registries';
/**
 * The player must be an altitude of atleast 151 blocks,
 * when sleeping , to breathe fresh air.
 */
@RegisterPower
export class Fresh_air implements Power {
	readonly id = 'fresh_air';
	readonly tickInterval = 20;
	private static readonly MIN_ALTITUDE = 151;

	onTick(player: Player): void {
		const currentY = Math.floor(player.location.y);
		const isSleeping = player.isSleeping;

		if (isSleeping && currentY < Fresh_air.MIN_ALTITUDE) {
			Fresh_air.wakeUpPlayer(player);
		}
	}

	private static wakeUpPlayer(player: Player): void {
		const { x, y, z } = player.location;

		player.teleport({ x, y: y + 0.1, z });

		player.onScreenDisplay.setActionBar('§cThe air is too thin! Sleep above Y=150.');
		player.playSound('note.bass');
	}
}
