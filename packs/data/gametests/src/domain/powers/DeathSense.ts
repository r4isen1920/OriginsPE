import { Player, Entity, EntityHitEntityAfterEvent, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

const STRENGTH_TICKS = 120; // 6 seconds
const STRENGTH_AMPLIFIER = 1; // Strength II 
const HP_THRESHOLD_PERCENT = 0.2; // 20%

@RegisterPower
export class DeathSense implements Power {
	readonly id = 'death_sense';

	onRelease(player: Player): void {
		player.removeEffect(MinecraftEffectTypes.Strength);
	}

	onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
		const target = ev.hitEntity;
		if (!target || !target.isValid) return;

		const health = target.getComponent('minecraft:health');
		if (!health) return;

		if (health.currentValue <= 0) return;

		const maxHealth = health.effectiveMax;
		if (maxHealth <= 0) return;

		const percent = health.currentValue / maxHealth;
		if (percent > HP_THRESHOLD_PERCENT) return;

		this.execute(player, target);
	}

	private execute(player: Player, target: Entity): void {
		target.kill();

		player.removeEffect(MinecraftEffectTypes.Strength);
		player.addEffect(MinecraftEffectTypes.Strength, STRENGTH_TICKS, {
			amplifier: STRENGTH_AMPLIFIER,
			showParticles: false
		});
	}
}
