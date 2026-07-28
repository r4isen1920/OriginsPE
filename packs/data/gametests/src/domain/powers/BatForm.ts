import {
	EntityEffectOptions,
	EntityHurtBeforeEvent,
	ItemUseBeforeEvent,
	Player,
	PlayerBreakBlockBeforeEvent
} from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services';
import {
	BeforeItemUse,
	BeforePlayerBreakBlock,
	BeforeEntityHurt
} from '../../core/platform/DecoratedEvents';

const FLAG_BAT_FORM = 'bat_form_active';

const DEBUFF_DURATION = 999999;
const DEBUFF: EntityEffectOptions = { amplifier: 3, showParticles: false };

export function isInBatForm(player: Player): boolean {
	return PlayerState.for(player).getFlag<boolean>(FLAG_BAT_FORM) ?? false;
}

function applyBatDebuffs(player: Player): void {
	player.addEffect('weakness', DEBUFF_DURATION, DEBUFF);
	player.addEffect('mining_fatigue', DEBUFF_DURATION, DEBUFF);
}

function clearBatDebuffs(player: Player): void {
	player.removeEffect('weakness');
	player.removeEffect('mining_fatigue');
}

@RegisterPower
export class BatForm implements Power {
	readonly id = 'bat_form';
	readonly tickInterval = 1;

	readonly active = {
		icon: '34',
		name: 'origins.trait.bat_form.name'
	};

	@BeforeItemUse
	static blockItemUseInBatForm(event: ItemUseBeforeEvent): void {
		if (isInBatForm(event.source)) {
			event.cancel = true;
		}
	}

	@BeforePlayerBreakBlock
	static blockBreakingInBatForm(event: PlayerBreakBlockBeforeEvent): void {
		if (isInBatForm(event.player)) {
			event.cancel = true;
		}
	}

	@BeforeEntityHurt
	static blockOutgoingDamageInBatForm(event: EntityHurtBeforeEvent): void {
		const attacker = event.damageSource.damagingEntity;
		if (attacker instanceof Player && isInBatForm(attacker)) {
			event.cancel = true;
		}
	}

	onActivate(player: Player): void {
		const state = PlayerState.for(player);
		const isActive = state.getFlag<boolean>(FLAG_BAT_FORM) ?? false;
		const next = !isActive;

		state.setFlag(FLAG_BAT_FORM, next);
		AttributeService.apply(player, {
			modelType: next ? 'bat' : 'normal'
		});

		if (next) {
			applyBatDebuffs(player);
		} else {
			player.removeEffect('levitation');
			clearBatDebuffs(player);
		}

		player.dimension.playSound('origins.bat.transform', player.location, {
			volume: 1.0,
			pitch: 1.25
		});
		player.dimension.spawnParticle('r4isen1920_originspe:bat', {
			x: player.location.x,
			y: player.location.y + 1,
			z: player.location.z
		});
	}

	onRelease(player: Player): void {
		clearBatDebuffs(player);

		PlayerState.for(player).setFlag(FLAG_BAT_FORM, undefined);
		AttributeService.apply(player, {
			modelType: 'normal'
		});
		player.removeEffect('levitation');
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		if (!(state.getFlag<boolean>(FLAG_BAT_FORM) ?? false)) return;

		if (player.isJumping) {
			const effectOptions: EntityEffectOptions = {
				amplifier: 3,
				showParticles: false
			};
			player.addEffect('levitation', 10, effectOptions);
		} else {
			player.removeEffect('levitation');
		}

		const velocity = player.getVelocity();
		if (velocity.y < -0.01 && !player.isSneaking) {
			const effectOptions: EntityEffectOptions = {
				amplifier: 0,
				showParticles: false
			};
			player.addEffect('slow_falling', 20, effectOptions);
		}
	}
}
