import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { isPlayerUnderground } from './ClawDigging';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

@RegisterPower
export class Claustrophobic implements Power {
    readonly id = 'claustrophobic';
    readonly tickInterval = 2;

    onTick(player: Player): void {
        if (!PlayerState.for(player).hasPower('claustrophobic')) return;

        if (isPlayerUnderground(player)||player.dimension.id !== 'minecraft:overworld') {
            player.addEffect(MinecraftEffectTypes.Weakness, 20, {
			amplifier: 1,
			showParticles: false
		});
        } else {
            player.removeEffect('weakness');
        }
    }
}