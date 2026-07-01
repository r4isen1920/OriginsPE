import { Player } from '@minecraft/server';
import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { AttributeService } from '../../services/AttributeService';

/** Baseline walking speed, matching {@link DEFAULT_ATTRIBUTES}. */
const DEFAULT_MOVEMENT = 0.1;
/** Half of {@link DEFAULT_MOVEMENT} — the documented 50% slowdown. */
const SLOWED_MOVEMENT = 0.05;

@RegisterPower
export class LightningSlowness implements Power {
    readonly id = 'lightning_slowness';
    readonly tickInterval = 3;

    onTick(player: Player): void {
        // Re-assert the debuff every tick instead of trusting a cached flag.
        // AttributeService diffs internally, so this only fires an entity event
        // when the value actually changed — notably after an origin/class change
        // force-reapplies the base movement speed, which a flag-based guard would
        // miss, leaving the player permanently un-slowed.
        AttributeService.apply(player, { movement: SLOWED_MOVEMENT });
    }

    onRelease(player: Player): void {
        AttributeService.apply(player, { movement: DEFAULT_MOVEMENT });
    }
}
