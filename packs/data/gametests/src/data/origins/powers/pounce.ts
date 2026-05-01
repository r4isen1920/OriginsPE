//pounce.ts
import { EntityDamageCause, world, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { ResourceBar } from "../../../origins/resource_bar";
import { Vector3 } from "../../../utils/Vec3";
import { removeTags } from "../../../utils/tags";

const MAX_DISTANCE = 10;

function pounce(player: Player): void {
  if (!player.hasTag("power_pounce")) return;

  if (player.hasTag("_control_hold_pounce")) {
    player.setDynamicProperty(
      "r4isen1920_originspe:pounce_hold_tick",
      Math.min(
        (typeof player.getDynamicProperty(
          "r4isen1920_originspe:pounce_hold_tick",
        ) === "number"
          ? (player.getDynamicProperty(
              "r4isen1920_originspe:pounce_hold_tick",
            ) as number)
          : 0) + 1,
        MAX_DISTANCE,
      ),
    );

    if (!player.hasTag("_pounce_charge")) {
      new ResourceBar(6, 0, 100, 4, true).push(player);
    }

    player.addTag("_pounce_charge");
  } else {
    if (player.hasTag("_pounce_charge")) {
      const pounceHoldTick =
        (player.getDynamicProperty(
          "r4isen1920_originspe:pounce_hold_tick",
        ) as number) ?? 0;
      const currentPouncePercent = Math.floor(
        (pounceHoldTick / MAX_DISTANCE) * 100,
      );
      new ResourceBar(6, currentPouncePercent, 0, 1).pop(player);

      // Only two arguments allowed for applyKnockback: directionVector, strength
      const viewDir = player.getViewDirection();
      const knockbackStrength = pounceHoldTick / 4;
      player.applyKnockback({ x: viewDir.x, z: viewDir.z }, knockbackStrength);

      // Use runCommand to play sound at player location
      player.runCommand(`playsound firework.launch @s ~ ~ ~ 1 1`);
      player.addTag("_pounce");
    }

    player.setDynamicProperty("r4isen1920_originspe:pounce_hold_tick", 0);
    player.removeTag("_pounce_charge");
  }

  if (player.hasTag("_pounce") && !player.isOnGround)
    player.addTag("_pounce_flew");

  if (player.hasTag("_pounce_flew") && player.isOnGround) {
    const nearbyEntities = player.dimension.getEntities({
      location: player.location,
      maxDistance: 4,
      excludeFamilies: ["inanimate"],
      excludeTags: ["power_pounce"],
    });
    nearbyEntities.forEach((entity) => {
      entity.applyDamage(6, {
        cause: EntityDamageCause.entityAttack,
        damagingEntity: player,
      });
    });

    player.dimension.spawnParticle(
      "r4isen1920_originspe:air_burst",
      Vector3.add(player.location, new Vector3(0, 0.5, 0)),
    );

    removeTags(player, "_pounce");
  }
}

toAllPlayers(pounce, 3);
