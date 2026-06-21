import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeService } from '../../services/AttributeService';

@RegisterPower
export class FamiliarFace implements Power {
	readonly id = 'familiar_face';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
		AttributeService.apply(player, { familyType: 'player' });
	}

	onTick(player: Player): void {
		AttributeService.apply(player, { familyType: 'enderman' });

		const nearbyEndermen = player.dimension.getEntities({
			type: 'minecraft:enderman',
			location: player.location,
			maxDistance: 64
		});

		for (const enderman of nearbyEndermen) {
			if (!enderman?.isValid) continue;

			enderman.triggerEvent('minecraft:on_calm');
		}
	}
}
