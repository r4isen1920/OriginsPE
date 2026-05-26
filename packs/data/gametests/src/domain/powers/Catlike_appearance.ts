import { Player, world, system } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerTick } from '../../core/Ticker';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class CatlikeAppearance implements Power {
	readonly id = 'catlike_appearance';
	private static readonly log = Log.get('CatlikeAppearance');

	constructor() {
		world.afterEvents.entityHurt.subscribe((event) => {
			try {
				const { damageSource, hurtEntity } = event;
				if (hurtEntity.typeId !== 'minecraft:creeper') return;
				if (
					!damageSource.damagingEntity ||
					!(damageSource.damagingEntity instanceof Player)
				)
					return;

				const player = damageSource.damagingEntity;
				const state = PlayerState.for(player);
				if (state.getOrigin() !== 'feline') return;

				state.setFlag(`creeper_retaliation_${hurtEntity.id}`, system.currentTick + 200);
			} catch (error: any) {
				CatlikeAppearance.log.error(
					`Error inside CatlikeAppearance combat tracker: ${error?.stack ?? error}`
				);
			}
		});
	}

	@PlayerTick(3)
	static onPlayerTick(player: Player): void {
		try {
			const state = PlayerState.for(player);

			if (state.getOrigin() !== 'feline') {
				player.triggerEvent('r4isen1920_originspe:family_type.player');
				return;
			}

			player.triggerEvent('r4isen1920_originspe:family_type.cat');

			const currentTick = system.currentTick;
			const nearbyCreepers = player.dimension.getEntities({
				location: player.location,
				maxDistance: 16,
				type: 'minecraft:creeper'
			});

			for (const creeper of nearbyCreepers) {
				try {
					const retaliationExpiry =
						state.getFlag<number>(`creeper_retaliation_${creeper.id}`) ?? 0;
					if (currentTick < retaliationExpiry) continue;

					creeper.triggerEvent('minecraft:stop_exploding');

					const targetComp = creeper.getComponent('target');
					if (targetComp && (targetComp as any).target?.id === player.id) {
						(targetComp as any).clearTarget();
					}

					const dx = creeper.location.x - player.location.x;
					const dz = creeper.location.z - player.location.z;
					const distance = Math.sqrt(dx * dx + dz * dz);

					if (distance < 10 && distance > 0.1) {
						creeper.applyImpulse({
							x: (dx / distance) * 0.4,
							y: 0.1,
							z: (dz / distance) * 0.4
						});
					}
				} catch {}
			}
		} catch (error: any) {
			CatlikeAppearance.log.error(
				`Error inside CatlikeAppearance tick handler: ${error?.stack ?? error}`
			);
		}
	}
}
