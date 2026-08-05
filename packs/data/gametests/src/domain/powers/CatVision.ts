import { Player, TicksPerSecond } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeSourceInstance } from '../../services';



@RegisterPower
export class CatVision implements Power {
	readonly id = 'cat_vision';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		player.removeEffect('night_vision');
	}

	onTick(player: Player, attributes: AttributeSourceInstance): void {
		const lightLevel = player.dimension.getLightLevel(player.location);

		if (lightLevel < 8) {
			player.addEffect('night_vision', TicksPerSecond * 12, { showParticles: false });
			attributes.set({
				attack: { add: 3 },
			})
		} else {
			player.removeEffect('night_vision');
			attributes.clear();
		}
	}
}
