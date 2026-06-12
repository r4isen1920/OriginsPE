import { BlockComponent } from '@bedrock-oss/stylish';
import {
	EntityHitEntityAfterEvent,
	Block,
	system,
	TicksPerSecond,
	BlockCustomComponent,
	BlockComponentTickEvent,
	Player
} from '@minecraft/server';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { RegisterPower } from '../Registries';
import { ResourceBarService } from '../../services/ResourceBarService';

@BlockComponent
export class FakeCobweb implements BlockCustomComponent {
	public static readonly componentId = 'r4isen1920_originspe:fake_cobweb';

	onTick(events: BlockComponentTickEvent): void {
		const block = events.block;
		const dimension = events.dimension;
		const loc = block.location;
		const currentBlock = block.dimension.getBlock({
			x: Math.floor(loc.x),
			y: Math.floor(loc.y),
			z: Math.floor(loc.z)
		});
		dimension.getEntitiesAtBlockLocation(block.location).forEach((entity) => {
			if (currentBlock?.typeId === 'r4isen1920_originspe:fake_cobweb') {
				if (entity instanceof Player) {
					const state = PlayerState.for(entity);
					if (state.hasPower('webbing')) return;
				}
				entity.addEffect('slowness', 5, { amplifier: 4, showParticles: false });
				entity.addEffect('slow_falling', 5, { amplifier: 4, showParticles: false });
				entity.addEffect('poison', 5, { amplifier: 0, showParticles: false });
			} else {
				entity.removeEffect('slowness');
				entity.removeEffect('slow_falling');
				entity.removeEffect('poison');
			}
		});

		if (!block || !block.isValid) return;
	}
}

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

		const trapEntity = player.dimension.spawnEntity(
			'r4isen1920_originspe:webbing_attack',
			target.location
		);

		if (trapEntity && trapEntity.isValid) {
			trapEntity.triggerEvent('r4isen1920_originspe:start_webbing_control');
		}

		const loc = target.location;
		const block1 = player.dimension.getBlock({
			x: Math.floor(loc.x),
			y: Math.floor(loc.y),
			z: Math.floor(loc.z)
		});

		if (block1?.isAir) {
			block1.setType('r4isen1920_originspe:fake_cobweb');
		}
	}
}
