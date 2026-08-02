import { Player, ItemCompleteUseAfterEvent, world } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { AfterItemCompleteUse } from '../../core/platform/DecoratedEvents';
import { PlayerTick } from '../../core/platform/Ticker';
import { AttributeOverrides } from '../../services';


/**
 * Your hitbox is reduced and you can move through 1-block high spaces without sneaking.
 */
@RegisterPower
export class CompactSize implements Power {
    readonly id = 'compact_size';

    readonly attributes: AttributeOverrides = {
        scale: -0.5,
        health: -6,
    };
}