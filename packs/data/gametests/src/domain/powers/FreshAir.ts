import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
/**
 * The player must be an altitude of atleast 151 blocks,
 * when sleeping , to breathe fresh air.
 */
@RegisterPower
export class FreshAir implements Power {
	readonly id = 'fresh_air';
	readonly tickInterval = 20;
	private static readonly MIN_ALTITUDE = 151;

	onTick(player: Player): void {
		const currentY = Math.floor(player.location.y);
		const isSleeping = player.isSleeping;

		if (isSleeping && currentY < FreshAir.MIN_ALTITUDE) {
			FreshAir.wakeUpPlayer(player);
		}
	}

	private static wakeUpPlayer(player: Player): void {
		const { x, y, z } = player.location;

		player.teleport({ x, y: y + 0.1, z });

		player.onScreenDisplay.setActionBar('§cThe air is too thin! Sleep above Y=150.');
		player.playSound('note.bass');
	}
}
