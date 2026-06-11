import { Player, world, system, EntityHealthComponent } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { FlagService } from '../../services/FlagService';
import { AfterEntityHitEntity, AfterEntityDie } from '../../core/DecoratedEvents';

@RegisterPower
export class Prescience implements Power {
	readonly id = 'prescience';
	readonly tickInterval = 6;

	@AfterEntityHitEntity
	static onEntityHitEntity(event: any): void {
		const { damagingEntity, hitEntity } = event;

		if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) return;
		if (!damagingEntity.isValid || !hitEntity.isValid) return;

		const casterState = PlayerState.for(damagingEntity);
		if (!casterState || casterState.getOrigin() !== 'diviner') return;

		const targetState = PlayerState.for(hitEntity);
		if (!targetState || targetState.getOrigin() === 'diviner') return;

		if (casterState.getFlag<string>('prescience_target_id') === hitEntity.id) return;

		const casterId = damagingEntity.id;

		for (const player of world.getAllPlayers()) {
			if (!player || !player.isValid) continue;
			const pState = PlayerState.for(player);
			if (!pState) continue;
			if (pState.getFlag<string>('prescience_linked_id') === casterId) {
				Prescience.removePrescienceEffect(player, pState);
			}
		}

		const casterHpComp = damagingEntity.getComponent(
			'minecraft:health'
		) as EntityHealthComponent;
		const targetHpComp = hitEntity.getComponent('minecraft:health') as EntityHealthComponent;
		if (!casterHpComp || !targetHpComp) return;

		const casterMissing = casterHpComp.effectiveMax - casterHpComp.currentValue;
		const targetMissing = targetHpComp.effectiveMax - targetHpComp.currentValue;

		const casterMax = casterHpComp.effectiveMax;
		const targetMax = targetHpComp.effectiveMax;

		const totalMaxHP = casterMax + targetMax;
		const amplifierValue = Math.max(0, Math.floor((totalMaxHP * 0.5) / 4));

		const expiryTick = system.currentTick + 240;

		casterState.setFlag('prescience_linked_id', casterId);
		casterState.setFlag('prescience_target_id', hitEntity.id);
		casterState.setFlag('prescience_expiry_tick', expiryTick);
		casterState.setFlag('prescience_static_amplifier', amplifierValue);

		targetState.setFlag('prescience_linked_id', casterId);
		targetState.setFlag('prescience_target_id', hitEntity.id);
		targetState.setFlag('prescience_expiry_tick', expiryTick);
		targetState.setFlag('prescience_static_amplifier', amplifierValue);

		damagingEntity.addEffect('health_boost', 240, {
			amplifier: amplifierValue,
			showParticles: false
		});
		hitEntity.addEffect('health_boost', 240, {
			amplifier: amplifierValue,
			showParticles: false
		});

		system.runTimeout(() => {
			if (damagingEntity.isValid) {
				const cHealth = damagingEntity.getComponent(
					'minecraft:health'
				) as EntityHealthComponent;
				if (cHealth)
					cHealth.setCurrentValue(Math.max(1, cHealth.effectiveMax - casterMissing));
			}
			if (hitEntity.isValid) {
				const tHealth = hitEntity.getComponent('minecraft:health') as EntityHealthComponent;
				if (tHealth)
					tHealth.setCurrentValue(Math.max(1, tHealth.effectiveMax - targetMissing));
			}
		}, 1);

		FlagService.set(hitEntity, 'flag_a', true);
		FlagService.set(damagingEntity, 'flag_a', true);

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
		if (!player || !player.isValid) return;

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
		for (const p of world.getAllPlayers()) {
			if (!p || !p.isValid) continue;
			const pState = PlayerState.for(p);
			if (!pState) continue;

			if (pState.getFlag<string>('prescience_linked_id') === linkedId) {
				Prescience.removePrescienceEffect(p, pState);
			}
		}
	}

	private static removePrescienceEffect(player: Player, state: PlayerState): void {
		if (!state) return;

		state.setFlag('prescience_linked_id', undefined);
		state.setFlag('prescience_target_id', undefined);
		state.setFlag('prescience_expiry_tick', undefined);
		state.setFlag('prescience_static_amplifier', undefined);

		if (player && player.isValid) {
			player.removeEffect('health_boost');
			FlagService.set(player, 'flag_a', false);
			player.playSound('respawn_anchor.deplete', { pitch: 1.75 });
		}
	}
}
