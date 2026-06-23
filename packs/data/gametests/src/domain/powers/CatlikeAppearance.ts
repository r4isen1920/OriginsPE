import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { AttributeService } from '../../services/AttributeService';
import { PlayerState } from '../../core';

@RegisterPower
export class CatlikeAppearance implements Power {
	readonly id = 'scare_creepers';
	readonly tickInterval = 3;

	onRelease(player: Player): void {
        AttributeService.apply(player, { familyType: 'player' });
    }

    onTick(player: Player): void {
        AttributeService.apply(player, { familyType: 'cat' });
    }
}
