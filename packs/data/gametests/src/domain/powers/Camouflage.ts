import { Player, world, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class Camouflage implements Power {
	readonly id = 'camouflage';
	private static readonly log = Log.get('Camouflage');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damageSource, hurtEntity } = event;
				if (
					!damageSource.damagingEntity ||
					!(damageSource.damagingEntity instanceof Player)
				)
					return;

				const player = damageSource.damagingEntity;
				const state = PlayerState.for(player);
				if (state.getOrigin() !== 'kitsune') return;

				const targetUid = hurtEntity.id;
				state.setFlag(`camo_retaliation_${targetUid}`, system.currentTick + 200);
			} catch (error: any) {
				Camouflage.log.error(
					`Error inside Camouflage combat tracker: ${error?.stack ?? error}`
				);
			}
		});
	}

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);

			if (state.getOrigin() !== 'kitsune') {
				player.triggerEvent('r4isen1920_originspe:family_type.player');
				return;
			}

			if (player.isSneaking) {
				player.triggerEvent('r4isen1920_originspe:family_type.camouflage');

				const currentTick = system.currentTick;
				const nearbyHostiles = player.dimension.getEntities({
					location: player.location,
					maxDistance: 16,
					excludeFamilies: ['player', 'inanimate']
				});

				for (const entity of nearbyHostiles) {
					try {
						const targetComp = entity.getComponent('target');
						if (!targetComp) continue;

						const currentTarget = (targetComp as any).target;
						if (!currentTarget || currentTarget.id !== player.id) continue;

						const retaliationExpiry =
							state.getFlag<number>(`camo_retaliation_${entity.id}`) ?? 0;
						if (currentTick < retaliationExpiry) continue;

						entity.clearVelocity();
						(targetComp as any).clearTarget();
					} catch {}
				}
			} else {
				player.triggerEvent('r4isen1920_originspe:family_type.player');
			}
		} catch (error: any) {
			Camouflage.log.error(`Error inside Camouflage tick handler: ${error?.stack ?? error}`);
		}
	}
}
