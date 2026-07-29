import {
	Player,
	TicksPerSecond,
	EntityHurtAfterEvent,
	EntityComponentTypes,
	system,
	world,
	Entity,
	Vector3,
	EntityDamageCause,
	MolangVariableMap
} from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';
import { BatForm } from './BatForm';
import { EntityUtils } from '../../utils/EntityUtils';
import { Particles } from '../../Files';
import { Vec3 } from '@bedrock-oss/bedrock-boost';
import { Log } from '../../utils';

@RegisterPower
export class Bloodthirsty implements Power {
	readonly id = 'bloodthirsty';
	readonly icon = '28';
	readonly tickInterval = 2;

	private static readonly log = Log.get('Bloodthirsty');

	private static readonly BAR_ID = 28;
	private static readonly BAR_SLOT = 3;

	private static readonly BLOOD_FLAG = 'vampire_blood';
	private static readonly MAX_BLOOD = 100;
	
	private static readonly DECAY_KEY = 'bloodthirsty_decay';
	private static readonly DECAY_INTERVAL_TICKS = 100; //5seconds
	private static readonly DECAY_AMOUNT = 1;

	private static readonly STARVE_DAMAGE_KEY = 'bloodthirsty_starve_damage';
	private static readonly STARVE_DAMAGE_INTERVAL_TICKS = TicksPerSecond * 1;
	private static readonly STARVE_DAMAGE_AMOUNT = 1;
	private static readonly WEAKNESS_REFRESH_TICKS = TicksPerSecond * 2;

	private static bloodPercent(blood: number): number {
		return Math.round(
			(Math.max(0, Math.min(Bloodthirsty.MAX_BLOOD, blood)) / Bloodthirsty.MAX_BLOOD) * 99
		);
	}

	static drainBlood(player: Player, amount: number): number {
		const state = PlayerState.for(player);
		let blood = state.getFlag<number>(Bloodthirsty.BLOOD_FLAG) ?? Bloodthirsty.MAX_BLOOD;
		blood = Math.max(0, blood - amount);
		state.setFlag(Bloodthirsty.BLOOD_FLAG, blood);
		Bloodthirsty.pushBloodBar(player, blood);
		return blood;
	}

	static getBlood(player: Player): number {
		const state = PlayerState.for(player);
		return state.getFlag<number>(Bloodthirsty.BLOOD_FLAG) ?? Bloodthirsty.MAX_BLOOD;
	}

	static pushBloodBar(player: Player, blood: number): void {
		const pct = Bloodthirsty.bloodPercent(blood);
		ResourceBarService.push(player, {
			id: Bloodthirsty.BAR_ID,
			slot: Bloodthirsty.BAR_SLOT,
			from: pct,
			to: pct,
			durationSeconds: 999,
			persist: true
		});
	}

	onAcquire(player: Player): void {
		const state = PlayerState.for(player);
		if (state.getFlag<number>(Bloodthirsty.BLOOD_FLAG) === undefined) {
			state.setFlag(Bloodthirsty.BLOOD_FLAG, Bloodthirsty.MAX_BLOOD);
		}
		const blood = state.getFlag<number>(Bloodthirsty.BLOOD_FLAG) ?? Bloodthirsty.MAX_BLOOD;
		Bloodthirsty.pushBloodBar(player, blood);
	}

	onRelease(player: Player): void {
		ResourceBarService.pop(player, Bloodthirsty.BAR_ID);
	}

	onDealDamage(player: Player, ev: EntityHurtAfterEvent): void {
		if (BatForm.isInBatForm(player)) return;

		const { damage, damageSource, hurtEntity } = ev;
		if (damage <= 0) return;
		if (!EntityUtils.isPlayer(damageSource.damagingEntity)) return;
		if (damageSource.damagingEntity.id !== player.id) return;
		if (damageSource.cause !== EntityDamageCause.entityAttack) return;

		if (!hurtEntity?.isValid) return;
		if (!hurtEntity.getComponent(EntityComponentTypes.Health)) return;

		const restoreAmount = Math.floor(damage * 2);
		if (restoreAmount <= 0) return;

		const state = PlayerState.for(player);
		let blood = state.getFlag<number>(Bloodthirsty.BLOOD_FLAG) ?? Bloodthirsty.MAX_BLOOD;
		blood = Math.min(Bloodthirsty.MAX_BLOOD, blood + restoreAmount);

		state.setFlag(Bloodthirsty.BLOOD_FLAG, blood);
		Bloodthirsty.pushBloodBar(player, blood);

		Bloodthirsty.log.debug(`Restored: ${restoreAmount} blood to ${player.name} (now at ${blood})`);

		const molang = new MolangVariableMap();
		molang.setFloat('particle_count', restoreAmount);
		const aabb = hurtEntity.getAABB();
		molang.setVector3('size', Vec3.from(aabb.extent).scale(0.67));
		player.dimension.spawnParticle(Particles.BloodthirstyBleed, Vec3.from(hurtEntity.location), molang);
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		const now = system.currentTick;

		let blood = state.getFlag<number>(Bloodthirsty.BLOOD_FLAG);
		if (blood === undefined) {
			blood = Bloodthirsty.MAX_BLOOD;
			state.setFlag(Bloodthirsty.BLOOD_FLAG, blood);
			Bloodthirsty.pushBloodBar(player, blood);
		}

		let lastDecayTick = state.getFlag<number>(Bloodthirsty.DECAY_KEY);
		if (lastDecayTick === undefined) {
			lastDecayTick = now;
			state.setFlag(Bloodthirsty.DECAY_KEY, lastDecayTick);
		}

		const elapsed = now - lastDecayTick;
		if (elapsed >= Bloodthirsty.DECAY_INTERVAL_TICKS) {
			const steps = Math.floor(elapsed / Bloodthirsty.DECAY_INTERVAL_TICKS);

			if (blood > 0) {
				blood = Math.max(0, blood - steps * Bloodthirsty.DECAY_AMOUNT);
				state.setFlag(Bloodthirsty.BLOOD_FLAG, blood);
				Bloodthirsty.pushBloodBar(player, blood);
			}

			state.setFlag(
				Bloodthirsty.DECAY_KEY,
				lastDecayTick + steps * Bloodthirsty.DECAY_INTERVAL_TICKS
			);
		}

		if (blood <= 0) {
			player.addEffect('weakness', Bloodthirsty.WEAKNESS_REFRESH_TICKS, {
				amplifier: 0,
				showParticles: false
			});

			if (!state.isOnCooldown(Bloodthirsty.STARVE_DAMAGE_KEY, now)) {
				player.applyDamage(Bloodthirsty.STARVE_DAMAGE_AMOUNT, { cause: 'starve' as any });
				state.setCooldown(
					Bloodthirsty.STARVE_DAMAGE_KEY,
					now,
					Bloodthirsty.STARVE_DAMAGE_INTERVAL_TICKS
				);
			}
		}
	}
}
