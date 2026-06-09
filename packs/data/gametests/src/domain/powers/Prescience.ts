import { Player, world, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { FlagService } from '../../services/FlagService';
import { AfterEntityHitEntity, AfterEntityDie } from '../../core/DecoratedEvents';

@RegisterPower
export class Prescience implements Power {
	readonly id = 'prescience';
	readonly tickInterval = 20;

	@AfterEntityHitEntity
	static onEntityHitEntity(event: any): void {
		const { damagingEntity, hitEntity } = event;

		if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) return;

		const casterState = PlayerState.for(damagingEntity);
		if (casterState.getOrigin() !== 'diviner') return;

		const targetState = PlayerState.for(hitEntity);
		if (targetState.getOrigin() === 'diviner') return;

		if (hitEntity.getEffect('health_boost') || damagingEntity.getEffect('health_boost')) return;

		const casterId = damagingEntity.id;

		for (const player of world.getAllPlayers()) {
			if (!player.isValid) continue;
			const pState = PlayerState.for(player);
			if (pState.getFlag<string>('prescience_linked_id') === casterId) {
				Prescience.removePrescienceEffect(player, pState);
			}
		}

		casterState.setFlag('prescience_linked_id', casterId);
		targetState.setFlag('prescience_linked_id', casterId);

		const casterHpComp = damagingEntity.getComponent('health');
		const targetHpComp = hitEntity.getComponent('health');

		const casterMax = casterHpComp ? casterHpComp.effectiveMax : 20;
		const targetMax = targetHpComp ? targetHpComp.effectiveMax : 20;

		const totalMaxHP = casterMax + targetMax;
		const boostAmount = Math.floor(totalMaxHP * 0.5);
		const amplifierValue = Math.max(0, Math.floor(boostAmount / 4) - 1);

		damagingEntity.addEffect('health_boost', TicksPerSecond * 12, {
			amplifier: amplifierValue,
			showParticles: false
		});

		hitEntity.addEffect('health_boost', TicksPerSecond * 12, {
			amplifier: amplifierValue,
			showParticles: false
		});

		if (casterHpComp) {
			casterHpComp.setCurrentValue(
				Math.min(
					casterHpComp.currentValue + boostAmount,
					casterHpComp.effectiveMax + boostAmount
				)
			);
		}
		if (targetHpComp) {
			targetHpComp.setCurrentValue(
				Math.min(
					targetHpComp.currentValue + boostAmount,
					targetHpComp.effectiveMax + boostAmount
				)
			);
		}

		FlagService.set(hitEntity, 'flag_a', true);

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
		const linkedId = state.getFlag<string>('prescience_linked_id');
		if (!linkedId) return;

		Prescience.breakLinkForEveryone(linkedId);
	}

	onTick(player: Player): void {
		if (!player.isValid) return;

		const state = PlayerState.for(player);
		const linkedId = state.getFlag<string>('prescience_linked_id');
		if (!linkedId) return;

		if (!player.getEffect('health_boost')) {
			Prescience.breakLinkForEveryone(linkedId);
		}
	}

	private static breakLinkForEveryone(linkedId: string): void {
		for (const p of world.getAllPlayers()) {
			if (!p.isValid) continue;
			const pState = PlayerState.for(p);
			if (pState.getFlag<string>('prescience_linked_id') === linkedId) {
				Prescience.removePrescienceEffect(p, pState);
			}
		}
	}

	private static removePrescienceEffect(player: Player, state: PlayerState): void {
		state.setFlag('prescience_linked_id', undefined);

		if (player.getEffect('health_boost')) {
			player.removeEffect('health_boost');
		}
		FlagService.set(player, 'flag_a', false);
		player.playSound('respawn_anchor.deplete', { pitch: 1.75 });
	}
}
