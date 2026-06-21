import { Player, world, system, EntityHealthComponent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { FlagService } from '../../services/FlagService';
import { AfterEntityHitEntity, AfterEntityDie } from '../../core/DecoratedEvents';
import { ResourceBarService } from '../../services/ResourceBarService';

const LINK_DURATION_TICKS = 240;

@RegisterPower
export class Prescience implements Power {
	readonly id = 'prescience';
	readonly tickInterval = 6;

	readonly active = {
		icon: '26',
		name: 'origins.trait.prescience.name'
	};

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		if (!state) return;

		if (state.getFlag<string>('prescience_linked_id')) {
			player.playSound('note.bass', { volume: 1.0, pitch: 1.5 });
			return;
		}

		const alreadyArmed = state.getFlag<boolean>('prescience_armed') === true;
		if (alreadyArmed) {
			state.setFlag('prescience_armed', false);
			player.playSound('note.bass', { volume: 1.0, pitch: 1.75 });
		} else {
			state.setFlag('prescience_armed', true);
			player.playSound('enchant.thorns.hit', { volume: 1.0, pitch: 1.5 });
		}
	}

	@AfterEntityHitEntity
	static onEntityHitEntity(event: any): void {
		const { damagingEntity, hitEntity } = event;

		if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) return;
		if (!damagingEntity.isValid || !hitEntity.isValid) return;

		const casterState = PlayerState.for(damagingEntity);
		if (!casterState || casterState.getOrigin() !== 'diviner') return;

		if (casterState.getFlag<boolean>('prescience_armed') !== true) return;

		const targetState = PlayerState.for(hitEntity);
		if (!targetState || targetState.getOrigin() === 'diviner') return;

		casterState.setFlag('prescience_armed', false);

		const casterHpComp = damagingEntity.getComponent(
			'minecraft:health'
		) as EntityHealthComponent;
		const targetHpComp = hitEntity.getComponent('minecraft:health') as EntityHealthComponent;
		if (!casterHpComp || !targetHpComp) return;

		const casterMissing = casterHpComp.effectiveMax - casterHpComp.currentValue;
		const targetMissing = targetHpComp.effectiveMax - targetHpComp.currentValue;

		const combined = casterHpComp.effectiveMax + targetHpComp.effectiveMax;
		const amplifier = Math.max(0, Math.floor(combined / 4) - 1);

		const casterId = damagingEntity.id;
		const linkExpiryTick = system.currentTick + LINK_DURATION_TICKS;

		for (const [player, set] of [
			[damagingEntity, casterState],
			[hitEntity, targetState]
		] as [Player, PlayerState][]) {
			set.setFlag('prescience_linked_id', casterId);
			set.setFlag('prescience_target_id', hitEntity.id);
			set.setFlag('prescience_expiry_tick', linkExpiryTick);
			set.setFlag('prescience_static_amplifier', amplifier);

			player.addEffect('health_boost', LINK_DURATION_TICKS, {
				amplifier,
				showParticles: false
			});
			FlagService.set(player, 'flag_a', true);
		}

		system.runTimeout(() => {
			if (damagingEntity.isValid) {
				const c = damagingEntity.getComponent('minecraft:health') as EntityHealthComponent;
				if (c) c.setCurrentValue(Math.max(1, c.effectiveMax - casterMissing));
			}
			if (hitEntity.isValid) {
				const t = hitEntity.getComponent('minecraft:health') as EntityHealthComponent;
				if (t) t.setCurrentValue(Math.max(1, t.effectiveMax - targetMissing));
			}
		}, 1);

		ResourceBarService.push(damagingEntity, {
			id: 26,
			durationSeconds: 14
		});

		hitEntity.dimension.playSound('ender_eye.dead', hitEntity.location, {
			volume: 1.5,
			pitch: 0.75
		});
	}

	@AfterEntityDie
	static onEntityDie(event: any): void {
		const { deadEntity } = event;
		if (!(deadEntity instanceof Player)) return;

		const state = PlayerState.for(deadEntity);
		if (!state) return;

		const linkedId = state.getFlag<string>('prescience_linked_id');
		if (!linkedId) return;

		Prescience.breakLinkForEveryone(linkedId);
	}

	onTick(player: Player): void {
		if (!player?.isValid) return;

		const state = PlayerState.for(player);
		if (!state) return;

		const linkedId = state.getFlag<string>('prescience_linked_id');
		if (!linkedId) return;

		const expiryTick = state.getFlag<number>('prescience_expiry_tick') ?? 0;
		if (system.currentTick >= expiryTick) {
			Prescience.breakLinkForEveryone(linkedId);
			return;
		}

		const staticAmp = state.getFlag<number>('prescience_static_amplifier') ?? 0;
		const remainingTicks = expiryTick - system.currentTick;

		if (remainingTicks > 0) {
			player.addEffect('health_boost', remainingTicks, {
				amplifier: staticAmp,
				showParticles: false
			});
		}
	}

	private static breakLinkForEveryone(linkedId: string): void {
		for (const player of world.getAllPlayers()) {
			if (!player?.isValid) continue;
			const playerState = PlayerState.for(player);
			if (!playerState) continue;
			if (playerState.getFlag<string>('prescience_linked_id') === linkedId) {
				Prescience.removePrescienceEffect(player, playerState);
			}
		}
	}

	private static removePrescienceEffect(player: Player, state: PlayerState): void {
		state.setFlag('prescience_linked_id', undefined);
		state.setFlag('prescience_target_id', undefined);
		state.setFlag('prescience_expiry_tick', undefined);
		state.setFlag('prescience_static_amplifier', undefined);

		if (player?.isValid) {
			player.removeEffect('health_boost');
			FlagService.set(player, 'flag_a', false);
			player.playSound('respawn_anchor.deplete', { pitch: 1.75 });
		}
	}
}
