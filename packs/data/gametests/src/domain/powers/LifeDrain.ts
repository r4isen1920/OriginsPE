import { Player } from '@minecraft/server';
import { RegisterPower } from '../Registries';
import { Power } from '../Ability';

@RegisterPower
export class LifeDrain implements Power {
    readonly id = 'life_drain';
}

export function lifeDrain(attacker: Player, hurtEntity: any): void {
    const attackerHealth = attacker.getComponent('health') as any;
    const hurtHealth = hurtEntity.getComponent('health') as any;
    if (!attackerHealth || !hurtHealth) return;

    const healthDecrement = Math.min(
        hurtHealth.effectiveMax - hurtHealth.currentValue,
        attackerHealth.effectiveMax * 0.5,
    );

    attackerHealth.setCurrentValue(
        Math.round(Math.max(attackerHealth.currentValue - healthDecrement, 2)),
    );
}