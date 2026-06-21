import { system } from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { AfterPlayerBreakBlock } from '../../core/DecoratedEvents';

const ALLOWED_BLOCK_IDS = [
	'minecraft:stone',
	'minecraft:cobblestone',
	'minecraft:mossy_cobblestone'
];

@RegisterPower
export class StrongArms implements Power {
	readonly id = 'strong_arms';

	@AfterPlayerBreakBlock
	static onBlockBreak(event: any): void {
		if (!event) return;
		const { block, brokenBlockPermutation, itemStackBeforeBreak, player } = event;

		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state || !state.hasPower('strong_arms')) return;

		const heldItemId = itemStackBeforeBreak?.typeId ?? 'none';
		if (heldItemId.includes('pickaxe')) return;

		const brokenBlockId = brokenBlockPermutation?.type?.id ?? 'unknown';
		if (!ALLOWED_BLOCK_IDS.includes(brokenBlockId)) return;

		const { x, y, z } = block.location;

		system.run(() => {
			if (!player.isValid) return;

			player.runCommand(`setblock ${x} ${y} ${z} ${brokenBlockId}`);
			player.runCommand(`setblock ${x} ${y} ${z} air [] destroy`);
		});
	}
}
