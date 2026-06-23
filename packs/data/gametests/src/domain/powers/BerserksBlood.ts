import { Player, EntityHurtAfterEvent, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

const STACK_KEY = 'berserks_blood:stacks';
const MAX_STACKS = 4;
const EFFECT_DURATION_TICKS = 200;

const ENTITY_DAMAGE_CAUSES = new Set([
	'entityAttack',
	'entityExplosion',
	'projectile',
	'magic',
	'thorns',
	'sonicBoom'
]);

/** Crimson Tracker gains 1 stack of Strength for every instance of damage taken from players or mobs,
 *  stacking up to a maximum of 4 Strength. */
const lastStackTick = new Map<string, number>();

@RegisterPower
export class BerserksBlood implements Power {
	readonly id = 'berserks_blood';

	onAcquire(player: Player): void {
		player.setDynamicProperty(STACK_KEY, 0);
		lastStackTick.delete(player.id);
	}

	onRelease(player: Player): void {
		player.setDynamicProperty(STACK_KEY, 0);
		player.removeEffect('strength');
	}

	onHurt(player: Player, ev: EntityHurtAfterEvent): void {
		if (!ENTITY_DAMAGE_CAUSES.has(ev.damageSource.cause)) return;

		const currentTick = system.currentTick;
		if (lastStackTick.get(player.id) === currentTick) return;
		lastStackTick.set(player.id, currentTick);

		const current = (player.getDynamicProperty(STACK_KEY) as number | undefined) ?? 0;
		const stacks = Math.min(current + 1, MAX_STACKS);

		player.setDynamicProperty(STACK_KEY, stacks);

		player.removeEffect(MinecraftEffectTypes.Strength);
		player.addEffect(MinecraftEffectTypes.Strength, EFFECT_DURATION_TICKS, {
			amplifier: stacks - 1,
			showParticles: false
		});
	}
}
