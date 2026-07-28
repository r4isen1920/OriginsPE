import { Player, system } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';

const DOUBLE_TAP_WINDOW_TICKS = 6;
const LEVITATION_AMPLIFIER = 2;
const LEVITATION_DURATION_TICKS = 10;

const GROUND_CHECK_DISTANCE = 5;
const SLOW_FALLING_AMPLIFIER = 0;
const SLOW_FALLING_DURATION_TICKS = 20;

interface JumpState {
	wasJumping: boolean;
	wasOnGround: boolean;
	lastAirJumpTick: number;
	unlocked: boolean;
	slowFallingActive: boolean;
}

const playerJumpStates = new Map<string, JumpState>();

@RegisterPower
export class DivineAscent implements Power {
	readonly id = 'divine_ascent';
	readonly tickInterval = 1;

	onRelease(player: Player): void {
		player.removeEffect('levitation');
	}

	onTick(player: Player): void {
		let state = playerJumpStates.get(player.id);
		if (!state) {
			state = {
				wasJumping: false,
				wasOnGround: true,
				lastAirJumpTick: -Infinity,
				unlocked: false,
				slowFallingActive: false
			};
			playerJumpStates.set(player.id, state);
		}

		const now = system.currentTick;
		const isJumping = player.isJumping;
		const isOnGround = player.isOnGround;
		const justPressed = isJumping && !state.wasJumping;

		if (isOnGround && !state.wasOnGround) {
			state.unlocked = false;
		}

		if (justPressed) {
			if (!isOnGround) {
				if (now - state.lastAirJumpTick <= DOUBLE_TAP_WINDOW_TICKS) {
					state.unlocked = true;

					
				}
				state.lastAirJumpTick = now;
			}
		}

		if (state.unlocked && isJumping) {
			player.addEffect('levitation', LEVITATION_DURATION_TICKS, {
				amplifier: LEVITATION_AMPLIFIER,
				showParticles: false
			});
		} else {
			player.removeEffect('levitation');
		}

		if (!isOnGround && !(state.unlocked && isJumping)) {
			const groundBlock = player.dimension.getBlockFromRay(
				player.location,
				{ x: 0, y: -1, z: 0 },
				{
					maxDistance: GROUND_CHECK_DISTANCE,
					includeLiquidBlocks: true,
					includePassableBlocks: false
				}
			);

			if (!groundBlock) {
				player.addEffect('slow_falling', SLOW_FALLING_DURATION_TICKS, {
					amplifier: SLOW_FALLING_AMPLIFIER,
					showParticles: false
				});
			}
		}

		const isFlying = !isOnGround && ((state.unlocked && isJumping) || state.slowFallingActive);

        if (isFlying) {
            player.dimension.spawnParticle('r4isen1920_originspe:zeus_clouds', player.location);
			player.dimension.playSound('random.zeus_clouds', player.location);
        }

		state.wasJumping = isJumping;
		state.wasOnGround = isOnGround;
	}
}
