
import { BlockPermutation, world } from "@minecraft/server";
import { ResourceBar } from "../../../origins/resource_bar";

world.afterEvents.entityHitEntity.subscribe(
  event => {

    const { damagingEntity, hitEntity } = event;

    if (!damagingEntity.hasTag('power_webbing') || damagingEntity.hasTag('cooldown_1')) return

    hitEntity.dimension
             .getBlock(hitEntity.location)
             .setPermutation(BlockPermutation.resolve('minecraft:web'));

    hitEntity.dimension
             .spawnEntity('r4isen1920_originspe:webbing_attack<r4isen1920_originspe:start_webbing_control>', hitEntity.location)

    new ResourceBar(1, 0, 100, 13)
        .push(damagingEntity)
  }
)
