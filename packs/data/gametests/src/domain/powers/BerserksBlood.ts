import { Player, EntityHurtAfterEvent, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';
import { PlayerState } from '../../core/platform/PlayerState';
import { ResourceBarService } from '../../services/ResourceBarService';

const COOLDOWN_KEY = 'berserks_blood_cooldown';
const EXPIRY_FLAG = 'berserks_blood_expiry';
const COOLDOWN_TICKS = 100; // 5 seconds
const STRENGTH_TICKS = 60;  // 3 seconds
const STRENGTH_AMPLIFIER = 3; // Strength IV 
const HP_THRESHOLD = 10; // 5 hp
const RESOURCE_BAR_ID = 27; 
const ENTITY_DAMAGE_CAUSES = new Set([
	'entityAttack',
	'entityExplosion',
	'projectile',
	'magic',
	'thorns',
	'sonicBoom'
]);

@RegisterPower
export class BerserksBlood implements Power {
	readonly id = 'berserks_blood';

	onRelease(player: Player): void {
		player.removeEffect(MinecraftEffectTypes.Strength);
		ResourceBarService.pop(player, RESOURCE_BAR_ID);
	}

	onHurt(player: Player, ev: EntityHurtAfterEvent): void {
		if (!ENTITY_DAMAGE_CAUSES.has(ev.damageSource.cause)) return;

		if (player.getComponent('minecraft:health')!.currentValue > HP_THRESHOLD) return;

		const state = PlayerState.for(player);
		const currentTick = system.currentTick;

		if (state.isOnCooldown(COOLDOWN_KEY, currentTick)) return;

		player.removeEffect(MinecraftEffectTypes.Strength);
		player.addEffect(MinecraftEffectTypes.Strength, STRENGTH_TICKS, {
			amplifier: STRENGTH_AMPLIFIER,
			showParticles: true,
		});

		ResourceBarService.push(player, {
			id: RESOURCE_BAR_ID,
			durationSeconds: 5,
			from: 100,
			to: 0,
		});

		state.setCooldown(COOLDOWN_KEY, currentTick, COOLDOWN_TICKS);
		state.setFlag(EXPIRY_FLAG, currentTick + COOLDOWN_TICKS);
	}
}