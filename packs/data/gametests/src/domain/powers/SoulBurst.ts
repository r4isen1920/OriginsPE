import {
	EntityComponentTypes,
	EntityDamageCause,
	EntityHealthComponent,
	Entity,
	Player,
	system
} from '@minecraft/server';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';

@RegisterPower
export class Soulburst implements Power {
	private static readonly log = Logger.getLogger('OriginsPE', 'Soulburst');
	private static readonly PHASE_KEY = 'r4isen1920_originspe:beelzebub_phase';
	private static readonly MAX_PHASE = 3;

	readonly id = 'soulburst';

	public static getBeelzebubPhase(player: Player): number {
		const state = PlayerState.for(player);
		return state.getFlag<number>(Soulburst.PHASE_KEY) ?? 0;
	}

	public static incrementBeelzebubPhase(player: Player, increment: number): void {
		const next = Math.min(
			Math.max(Soulburst.getBeelzebubPhase(player) + increment, 0),
			Soulburst.MAX_PHASE
		);
		const state = PlayerState.for(player);
		state.setFlag(Soulburst.PHASE_KEY, next);
	}

	public static resetBeelzebubPhase(player: Player): void {
		const state = PlayerState.for(player);
		state.setFlag(Soulburst.PHASE_KEY, 0);
	}

	public static triggerSoulburst(attacker: Player, hurtEntity: Entity): void {
		if (Soulburst.getBeelzebubPhase(attacker) < Soulburst.MAX_PHASE) return;

		const attackerHealth = Soulburst.readHealth(attacker);
		const hurtHealth = Soulburst.readHealth(hurtEntity);
		if (!attackerHealth || !hurtHealth) {
			Soulburst.log.warn(
				`Missing health component. attacker: ${attacker.typeId}, target: ${hurtEntity.typeId}`
			);
			return;
		}

		const attackerMissing = Math.max(
			0,
			attackerHealth.effectiveMax - attackerHealth.currentValue
		);
		const targetMissing = Math.max(0, hurtHealth.effectiveMax - hurtHealth.currentValue);

		if (attackerMissing > 0) {
			hurtEntity.applyDamage(Math.ceil(attackerMissing), {
				cause: EntityDamageCause.entityAttack,
				damagingEntity: attacker
			});
		}

		if (targetMissing > 0) {
			system.run(() => {
				const currentHealth = Soulburst.readHealth(attacker);
				if (!currentHealth) return;
				currentHealth.setCurrentValue(
					Math.min(currentHealth.currentValue + targetMissing, currentHealth.effectiveMax)
				);
			});
		}

		Soulburst.resetBeelzebubPhase(attacker);

		hurtEntity.dimension.spawnParticle('r4isen1920_originspe:voidwalker_soulburst', {
			x: hurtEntity.location.x,
			y: hurtEntity.location.y + 1,
			z: hurtEntity.location.z
		});

		const headLoc = attacker.getHeadLocation();
		const viewDir = attacker.getViewDirection();
		attacker.dimension.spawnParticle('r4isen1920_originspe:voidwalker_beelzebub_phase_4', {
			x: headLoc.x + viewDir.x * 1.75,
			y: headLoc.y + viewDir.y * 1.75,
			z: headLoc.z + viewDir.z * 1.75
		});

		Soulburst.log.info(`Triggered for player: ${attacker.name}, target: ${hurtEntity.typeId}`);
	}

	private static readHealth(entity: Entity): EntityHealthComponent | undefined {
		return entity.getComponent(EntityComponentTypes.Health) as
			| EntityHealthComponent
			| undefined;
	}
}
