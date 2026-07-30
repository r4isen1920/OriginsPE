import { Player, Entity, EntityHitEntityAfterEvent, system, TicksPerSecond, EntityComponentTypes, world } from '@minecraft/server';
import { RegisterPower } from '../../core/abilities/Registries';
import { Power } from '../../core/abilities/Ability';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';
import { Log } from '../../utils';
import { Entities, EntityProperties } from '../../Files';
import { Vec3 } from '@bedrock-oss/bedrock-boost';

@RegisterPower
export class DeathSense implements Power {
    readonly id = 'death_sense';
	readonly icon = '27';
    readonly tickInterval = 2;


    private static readonly log = Log.get('DeathSense');

    private static readonly HP_THRESHOLD_PERCENT = 0.2; // 20%

    private static trackedTargets = new Map<string, string>();
    private static readonly MARK_EXPIRATION_TICKS = TicksPerSecond * 10; // 10 seconds


    //#region Execute

    onAttack(player: Player, ev: EntityHitEntityAfterEvent): void {
        const target = ev.hitEntity;
        if (!target || !target.isValid) return;

        if (!DeathSense.trackedTargets.has(target.id)) return;

        const markTick = target.getDynamicProperty('r4isen1920_originspe:death_sense.mark_tick') as number | undefined;
        if (markTick !== undefined && markTick === system.currentTick) return;

        if (!DeathSense.isReadyForExecution(target)) return;
        this.execute(player, target);
    }

    private execute(player: Player, target: Entity): void {
        // ~~remove the marker so it doesn't linger as a ghost waiting for the next onTick interval
        const markerId = DeathSense.trackedTargets.get(target.id);
        if (markerId) {
            const marker = world.getEntity(markerId);
            if (marker && marker.isValid) marker.remove();
            DeathSense.trackedTargets.delete(target.id);
        }

        target.kill();
    }

    /**
     * Returns `true` if the specified target is ready for execution, `false` otherwise.
     */
    private static isReadyForExecution(target: Entity): boolean {
        const health = target.getComponent(EntityComponentTypes.Health);
        if (!health) return false;

        if (health.currentValue <= 0) return false;

        const maxHealth = health.effectiveMax;
        if (maxHealth <= 0) return false;

        const percent = health.currentValue / maxHealth;
        if (percent > DeathSense.HP_THRESHOLD_PERCENT) return false;
        return true;
    }


    //#region Marker

    onTick(player: Player): void {
        const { location, dimension } = player;

        // expire
        for (const [targetId, markerId] of DeathSense.trackedTargets.entries()) {
            const target = world.getEntity(targetId);
            const marker = world.getEntity(markerId);

            let shouldRemove = false;
			/** The reason why this marker was removed. for logging purposes. */
			let removedReason: string | undefined = 'unknown';

            if (!target || !target.isValid) {
                shouldRemove = true;
				removedReason = 'target is invalid';
            } else if (!DeathSense.isReadyForExecution(target)) {
                shouldRemove = true;
				removedReason = 'target not ready for execution';
            } else if (marker && marker.isValid) {
                const dx = location.x - target.location.x;
                const dy = location.y - target.location.y;
                const dz = location.z - target.location.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance > 8) {
                    let expireTick = marker.getDynamicProperty('expireTick') as number | undefined;
                    if (expireTick === undefined) {
                        expireTick = system.currentTick + DeathSense.MARK_EXPIRATION_TICKS;
                        marker.setDynamicProperty('expireTick', expireTick);
                    } else if (system.currentTick >= expireTick) {
                        shouldRemove = true;
						removedReason = 'marker expired';
                    }
                } else {
                    marker.setDynamicProperty('expireTick', undefined);
                }
            }

            if (shouldRemove) {
                if (marker && marker.isValid) marker.remove();
                DeathSense.trackedTargets.delete(targetId);

				// clean up the dynamic property if they healed/escaped
                if (target && target.isValid) {
					target.setDynamicProperty('r4isen1920_originspe:death_sense.mark_tick', undefined);
				}
				DeathSense.log.info(`Removed: ${target?.typeId ?? 'target unloaded'}, by: ${player.name}, reason: ${removedReason}`);
            } else if (!marker || !marker.isValid) {
                DeathSense.trackedTargets.delete(targetId);
                if (target && target.isValid) {
					target.setDynamicProperty('r4isen1920_originspe:death_sense.mark_tick', undefined);
				}
				DeathSense.log.info(`Removed: ${target?.typeId ?? 'target unloaded'}, by: ${player.name}, reason: marker invalid`);
            }
        }

        // mark new potential targets
        const nearbyEntities = dimension.getEntities({
            location,
            maxDistance: 8,
            excludeFamilies: ['inanimate']
        });

        for (const e of nearbyEntities) {
            if (e.id === player.id) continue;

            if (!DeathSense.isReadyForExecution(e)) continue;
            DeathSense.markEntity(e, player);
        }
    }

    static markEntity(entity: Entity, player: Player): void {
        if (!entity.isValid) return;

        const existingMarkerId = DeathSense.trackedTargets.get(entity.id);
        let marker: Entity | undefined;

        if (existingMarkerId) {
            marker = world.getEntity(existingMarkerId);
        }

		const aabb = entity.getAABB();
		const spawnOn = Vec3.from(aabb.center);

        if (marker && marker.isValid) {
            marker.tryTeleport(spawnOn);
        } else {
            marker = entity.dimension.spawnEntity(Entities.EntityMark, spawnOn);
			player.setPropertyOverrideForEntity(marker, EntityProperties.EntityMark.IsVisible, true);

            DeathSense.trackedTargets.set(entity.id, marker.id);

            entity.setDynamicProperty('r4isen1920_originspe:death_sense.mark_tick', system.currentTick);
			entity.dimension.playSound('note.bell', spawnOn, {
				volume: 0.67,
				pitch: Math.random() * 0.4 + 1.0
			});
			this.log.info(`Marked: ${entity.typeId}, by: ${player.name}`);
        }
    }
}