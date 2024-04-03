
import { world } from "@minecraft/server";
import { ResourceBar } from "../../../origins/resource_bar";

world.afterEvents.entityHitEntity.subscribe(
  event => {

    const { damagingEntity, hitEntity } = event;

    if (!damagingEntity.hasTag('power_webbing')) return

    hitEntity.dimension.spawnEntity('r4isen1920_originspe:webbing_attack<r4isen1920_originspe:start_webbing_control>', hitEntity.location)

    const cooldown = new ResourceBar(1, 0, 100, 13)
                        .push(damagingEntity)
  }
)
