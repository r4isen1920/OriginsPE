import { ButtonState, EntityDamageCause, GameMode, InputButton, Player } from '@minecraft/server';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeOverrides, AttributeService } from '../../services';
import { Log } from '../../utils/Log';


/** Per-player transient flight state used to drive double-jump detection. */
interface FlightState {
	flying: boolean;
	/** True once the player has jumped off the ground and is eligible for the mid-air trigger. */
	armed: boolean;
	/** Altitude the player is holding while hovering. */
	holdY: number;
	prevJump: boolean;
	prevGround: boolean;
}


/**
 * Double jump to enter a hovering flight. Hold JUMP to ascend, SNEAK to descend,
 * and hold neither to maintain the current height. Flight ends on landing.
 */
@RegisterPower
export class DivineAscent implements Power {
	private static readonly log = Log.get('DivineAscent');

	readonly id = 'divine_ascent';
	readonly tickInterval = 1;

	readonly attributes: AttributeOverrides = {
		damageOverrides: [
			{
				cause: EntityDamageCause.fall,
				multiplier: 0,
			}
		]
	};


	/** Levitation amplifier used to climb while JUMP is held. */
	private static readonly ASCEND_AMPLIFIER = 5;
	/** Gentle amplifier used to nudge the player back up to their hold altitude. */
	private static readonly LIFT_AMPLIFIER = 0;
	/** How far the player may sink below the hold altitude before a lift kicks in. */
	private static readonly HOLD_TOLERANCE = 0.01;
	/** Refreshed effect duration, in ticks, re-applied every tick while flying. */
	private static readonly EFFECT_DURATION = 40;

	private readonly runtime = new Map<string, FlightState>();


	//#region HOOKS

	onTick(player: Player): void {
		if (!player.isValid) return;

		const rt = this.stateFor(player.id);

		const gm = player.getGameMode();
		if (gm === GameMode.Creative || gm === GameMode.Spectator) {
			if (rt.flying) this.stopFlight(player, rt);
			rt.armed = false;
			return;
		}

		const input = player.inputInfo;
		const jumpHeld = input.getButtonState(InputButton.Jump) === ButtonState.Pressed;
		const sneakHeld = input.getButtonState(InputButton.Sneak) === ButtonState.Pressed;
		const onGround = player.isOnGround;
		const jumpRising = jumpHeld && !rt.prevJump;

		if (onGround) {
			if (rt.flying) this.stopFlight(player, rt);
			rt.armed = false;
		} else {
			// Arm only when leaving the ground with upward velocity (a real jump, not a fall).
			if (rt.prevGround) rt.armed = player.getVelocity().y > 0.1;

			if (rt.flying) {
				this.maintainFlight(player, rt, jumpHeld, sneakHeld);
			} else if (rt.armed && jumpRising) {
				this.startFlight(player, rt);
			}
		}

		rt.prevJump = jumpHeld;
		rt.prevGround = onGround;
	}

	onRelease(player: Player): void {
		const rt = this.runtime.get(player.id);
		if (rt?.flying) this.stopFlight(player, rt);
		this.runtime.delete(player.id);
	}


	//#region FLIGHT

	private startFlight(player: Player, rt: FlightState): void {
		rt.flying = true;
		rt.armed = false;
		rt.holdY = player.location.y;
		AttributeService.apply(player, { emitterType: 'zeus_clouds' });
		DivineAscent.log.info(`Flight started for player: ${player.name}`);
	}

	private stopFlight(player: Player, rt: FlightState): void {
		rt.flying = false;
		player.removeEffect(MinecraftEffectTypes.Levitation);
		player.removeEffect(MinecraftEffectTypes.SlowFalling);
		AttributeService.apply(player, { emitterType: 'none' });
		DivineAscent.log.info(`Flight ended for player: ${player.name}`);
	}

	private maintainFlight(player: Player, rt: FlightState, jumpHeld: boolean, sneakHeld: boolean): void {
		const y = player.location.y;

		if (jumpHeld) {
			rt.holdY = y;
			this.levitate(player, DivineAscent.ASCEND_AMPLIFIER);
			return;
		}

		if (sneakHeld) {
			rt.holdY = y;
			player.removeEffect(MinecraftEffectTypes.Levitation);
			player.addEffect(MinecraftEffectTypes.SlowFalling, DivineAscent.EFFECT_DURATION, {
				amplifier: 0,
				showParticles: false,
			});
			return;
		}

		// Hover: lift back toward the hold altitude only once the player has sunk below it.
		if (y < rt.holdY - DivineAscent.HOLD_TOLERANCE) {
			this.levitate(player, DivineAscent.LIFT_AMPLIFIER);
		} else if (y >= rt.holdY) {
			player.removeEffect(MinecraftEffectTypes.Levitation);
		}
	}

	private levitate(player: Player, amplifier: number): void {
		player.removeEffect(MinecraftEffectTypes.SlowFalling);
		player.addEffect(MinecraftEffectTypes.Levitation, DivineAscent.EFFECT_DURATION, {
			amplifier,
			showParticles: false,
		});
	}

	private stateFor(playerId: string): FlightState {
		let rt = this.runtime.get(playerId);
		if (!rt) {
			rt = { flying: false, armed: false, holdY: 0, prevJump: false, prevGround: true };
			this.runtime.set(playerId, rt);
		}
		return rt;
	}
}
