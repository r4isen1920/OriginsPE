import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

/**
 * Claustrophobia is a slow debuff that builds up when Elytrians are in tight spaces 
 */

@RegisterPower
export class Claustrophobia implements Power {
	readonly id = 'claustrophobia';
	private static readonly log = Log.get('Claustrophobia');

	@PlayerTick(2)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);
			if (state.getOrigin() !== 'elytrian') return;

			const headLocation = player.getHeadLocation();
			const ceilingBlock = player.dimension.getBlockAbove({
				x: headLocation.x,
				y: headLocation.y,
				z: headLocation.z
			});

			let claustrophobiaLevel = state.getFlag<number>('claustrophobia_level') ?? 0;

			if (!ceilingBlock || !ceilingBlock.isValid || ceilingBlock.isAir) {
				claustrophobiaLevel = Math.max(claustrophobiaLevel - 2, 0);
			} else {
				claustrophobiaLevel = Math.min(claustrophobiaLevel + 2, 200);
			}

			state.setFlag('claustrophobia_level', claustrophobiaLevel);

			if (claustrophobiaLevel < 150) {
				state.setFlag('is_claustrophobic_slow', false);
				player.triggerEvent('r4isen1920_originspe:attack.1');

				if (state.getFlag<boolean>('is_heavy') !== true) {
					player.triggerEvent('r4isen1920_originspe:movement.0.1');
				}
			} else {
				state.setFlag('is_claustrophobic_slow', true);
				player.triggerEvent('r4isen1920_originspe:attack.0');
				player.triggerEvent('r4isen1920_originspe:movement.0.05');
			}
		} catch (error: any) {
			Claustrophobia.log.error(
				`Error inside Claustrophobia tick handler: ${error?.stack ?? error}`
			);
		}
	}
}
