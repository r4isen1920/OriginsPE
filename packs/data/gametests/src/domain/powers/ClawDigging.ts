import {
	EquipmentSlot,
	GameMode,
	Player,
	PlayerBreakBlockBeforeEvent,
	system,
	world
} from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { PlayerTick } from '../../core/platform/Ticker';

const CEILING_SCAN_HEIGHT = 15;
const HASTE_AMPLIFIER = 10;

export function isPlayerUnderground(player: Player): boolean {
	const loc = player.location;

	if (loc.y < 60) return true;

	for (let dy = 1; dy <= CEILING_SCAN_HEIGHT; dy++) {
		const block = player.dimension.getBlock({
			x: Math.floor(loc.x),
			y: Math.floor(loc.y) + dy,
			z: Math.floor(loc.z)
		});
		if (block !== undefined && !block.isAir) return true;
	}

	return false;
}

/**
 * Allows the player to dig with their bare hands with haste effects based on block type.
 */
@RegisterPower
export class ClawDigging implements Power {
	readonly id = 'claw_digging';

	static {
		world.beforeEvents.playerBreakBlock.subscribe((ev) => ClawDigging.onBeforeBreak(ev));
	}

	@PlayerTick(1)
	static onPlayerTick(player: Player): void {
		if (!PlayerState.for(player).hasPower('claw_digging')) return;

		if (player.isInWater) return;

		const heldItem = player.getComponent('equippable')?.getEquipment(EquipmentSlot.Mainhand);
		const isBareHanded = !heldItem || heldItem.typeId === 'minecraft:air';

		if (!isBareHanded || !isPlayerUnderground(player)) {
			const existing = player.getEffect('haste');
			if (existing?.amplifier === HASTE_AMPLIFIER) {
				player.removeEffect('haste');
			}
			return;
		}

		player.addEffect('haste', 250, { amplifier: HASTE_AMPLIFIER, showParticles: false });
	}

	private static onBeforeBreak(ev: PlayerBreakBlockBeforeEvent): void {
		const { player, block } = ev;

		if (!PlayerState.for(player).hasPower('claw_digging')) return;
		if (player.getGameMode() === GameMode.Creative) return;

		ev.cancel = true;
		const { x, y, z } = block.location;
		system.run(() => {
			player.runCommand(`setblock ${x} ${y} ${z} air destroy`);
		});
	}
}
