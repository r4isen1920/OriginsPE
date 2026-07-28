import { Player } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { PlayerState } from '../../core/platform/PlayerState';
import { AttributeService } from '../../services';

@RegisterPower
export class DivineAscent implements Power {
	readonly id = 'divine_ascent';
	readonly tickInterval = 1;

}
