import {
	EntityHitEntityAfterEvent,
	system,
	TicksPerSecond,
	Player,
	BlockPermutation
} from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { RegisterPower } from '../../core/abilities/Registries';
import { ResourceBarService } from '../../services/ResourceBarService';
import { MinecraftBlockTypes, MinecraftEffectTypes } from '@minecraft/vanilla-data';
import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { Blocks, Particles } from '../../Files';



@RegisterPower
export class Webbing implements Power {
	readonly id = 'webbing';
	readonly icon = '01';
	readonly tickInterval = 1;

	private static readonly COOLDOWN_BAR_ID = 1;
	private static readonly COOLDOWN_KEY = 'webbing';
	private static readonly COOLDOWN_TICKS = TicksPerSecond * 13;

	onAttack(player: Player, event: EntityHitEntityAfterEvent): void {
		const target = event.hitEntity;
		if (!target || !target.isValid) return;

		const state = PlayerState.for(player);
		if (!state.hasPower('webbing')) return;

		const now = system.currentTick;
		if (state.isOnCooldown(Webbing.COOLDOWN_KEY, now)) return;

		state.setCooldown(Webbing.COOLDOWN_KEY, now, Webbing.COOLDOWN_TICKS);
		ResourceBarService.push(player, {
			id: Webbing.COOLDOWN_BAR_ID,
			durationSeconds: 13
		});

		const targetDim = target.dimension;
		const targetLoc = Vec3.from(target.location);

		const targetBlock = targetDim.getBlock(targetLoc);
		if (targetBlock && targetBlock.isAir) {
			const targetBlockLoc = Vec3.from(targetBlock.bottomCenter());

			target.teleport(targetBlockLoc);

			targetBlock.setPermutation(
				BlockPermutation.resolve(Blocks.FakeCobweb, {
					'r4isen1920_originspe:is_from_attack': true,
				})
			);
			targetDim.spawnParticle(Particles.WebbingTrap, targetBlockLoc);
			targetDim.playSound('mob.spider.death', targetBlockLoc);

			let trapTick = 0;
			const trapRunId = system.runInterval(() => {
				trapTick++;

				const blockAlive = targetBlock.isValid && targetBlock.typeId === Blocks.FakeCobweb;

				if (!target.isValid || !blockAlive || trapTick >= TicksPerSecond * 6) {
					system.clearRun(trapRunId);
					if (blockAlive) {
						targetBlock.setType(MinecraftBlockTypes.Air);
						targetDim.spawnParticle(Particles.WebbingPoof, targetBlockLoc);
						targetDim.playSound('random.fizz', targetBlockLoc);
					}
					return;
				}

				target.teleport(targetBlockLoc);
			}, 1);
		}
	}
}
