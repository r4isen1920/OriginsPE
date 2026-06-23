import {
    BlockPermutation,
    ItemStack,
    Player,
    EquipmentSlot,
    EntityEquippableComponent,
    EntityInventoryComponent,
    ItemDurabilityComponent,
    world
} from '@minecraft/server';

import { Perk } from '../../core/abilities/Ability';
import { RegisterPerk } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';


@RegisterPerk
export class EfficientRepairs implements Perk {
    readonly id = 'efficient_repairs';
    
}