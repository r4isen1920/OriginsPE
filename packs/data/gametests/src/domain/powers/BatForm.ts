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
import { AttributeService, ModelService } from '../../services';
import {
	BeforeItemUse,
	BeforePlayerBreakBlock,
	BeforeEntityHurt
} from '../../core/platform/DecoratedEvents';



@RegisterPower
export class BatForm implements Power {
	readonly id = 'bat_form';
	readonly tickInterval = 1;

	readonly active = {
		icon: '34',
		name: 'origins.trait.bat_form.name'
	};

	private static readonly FLAG_BAT_FORM = 'bat_form_active';


	//#region Hooks

	onActivate(player: Player): void {
		if (ModelService.isTransitioning(player)) return;

		const state = PlayerState.for(player);
		const isActive = state.getFlag<boolean>(BatForm.FLAG_BAT_FORM) ?? false;
		const next = !isActive;

		state.setFlag(BatForm.FLAG_BAT_FORM, next);
		AttributeService.apply(player, {
			modelType: next ? 'bat' : 'normal'
		});

		if (!next) {
			player.removeEffect('levitation');
		}

		// player.dimension.playSound('origins.bat.transform', player.location, {
		// 	volume: 1.0,
		// 	pitch: 1.25
		// });
		// player.dimension.spawnParticle('r4isen1920_originspe:bat', {
		// 	x: player.location.x,
		// 	y: player.location.y + 1,
		// 	z: player.location.z
		// });
	}

	onRelease(player: Player): void {
		PlayerState.for(player).setFlag(BatForm.FLAG_BAT_FORM, undefined);
		AttributeService.apply(player, {
			modelType: 'normal'
		});
		player.removeEffect('levitation');
	}

	onTick(player: Player): void {
		const state = PlayerState.for(player);
		if (!(state.getFlag<boolean>(BatForm.FLAG_BAT_FORM) ?? false)) return;

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


	//#region Cancels

	@BeforeItemUse
	static blockItemUseInBatForm(event: ItemUseBeforeEvent): void {
		if (BatForm.isInBatForm(event.source)) {
			event.cancel = true;
		}
	}

	@BeforePlayerBreakBlock
	static blockBreakingInBatForm(event: PlayerBreakBlockBeforeEvent): void {
		if (BatForm.isInBatForm(event.player)) {
			event.cancel = true;
		}
	}

	@BeforeEntityHurt
	static blockOutgoingDamageInBatForm(event: EntityHurtBeforeEvent): void {
		const attacker = event.damageSource.damagingEntity;
		if (attacker instanceof Player && BatForm.isInBatForm(attacker)) {
			event.cancel = true;
		}
	}


	//#region Helpers
	/**
	 * Returns `true` if the specified player is in bat form.
	 * If the player does not posses this power, it is assumed not and will always return `false`.
	 */
	public static isInBatForm(player: Player): boolean {
		return PlayerState.for(player).getFlag<boolean>(BatForm.FLAG_BAT_FORM) ?? false;
	}

}
