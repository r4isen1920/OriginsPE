import { EntityDamageCause, Player, world } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';
import { PlayerState } from '../../core/PlayerState';
import { Log } from '../../utils/Log';

@RegisterPower
export class StrongAnkles implements Power {
	readonly id = 'strong_ankles';
	private static readonly log = Log.get('StrongAnkles');

	constructor() {
		StrongAnkles.registerFallListener();
	}

	private static registerFallListener(): void {
		if ((globalThis as any).strongAnklesListenerLoaded) return;

		world.beforeEvents.entityHurt.subscribe((event) => {
			const { damageSource, hurtEntity } = event;

			if (!(hurtEntity instanceof Player)) return;

			try {
				const state = PlayerState.for(hurtEntity);
				if (state.getOrigin() !== 'feline' && state.getOrigin() !== 'kitsune') return;

				if (damageSource.cause === EntityDamageCause.fall) {
					event.cancel = true;
				}
			} catch (e: any) {
				this.log.error(`Error handling fall damage: ${e?.stack ?? e}`);
			}
		});

		(globalThis as any).strongAnklesListenerLoaded = true;
		StrongAnkles.log.info('Fall damage immunity listener registered successfully.');
	}
}
