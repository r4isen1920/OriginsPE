import { TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { Vec3 } from "@bedrock-oss/bedrock-boost";

function umbral_veil(player: Player): void {
  if (!player.hasTag("power_umbral_veil")) return;

  if (player.isSprinting)
    player.dimension.spawnParticle(
      "r4isen1920_originspe:voidwalker_veil_ground",
      Vec3.from(player.location).add(new Vec3(0, 1, 0)),
    );

  if (!player.isSprinting && player.hasTag("_umbrail_veil_in")) {
    player.triggerEvent("r4isen1920_originspe:skin_type.normal");
    player.removeEffect("speed");

    player.dimension.spawnParticle(
      "r4isen1920_originspe:voidwalker_veil",
      Vec3.from(player.location).add(new Vec3(0, 1, 0)),
    );

    player.removeTag("_umbrail_veil_in");
  }

  if (player.isSprinting && !player.hasTag("_umbrail_veil_in")) {
    player.triggerEvent("r4isen1920_originspe:skin_type.shadow");
    player.addEffect("speed", TicksPerSecond * 12, {
      amplifier: 0,
      showParticles: false,
    });

    player.dimension.playSound("respawn_anchor.charge", player.location, {
      volume: 0.5,
      pitch: 1.25,
    });
    player.dimension.spawnParticle(
      "r4isen1920_originspe:voidwalker_veil",
      Vec3.from(player.location).add(new Vec3(0, 1, 0)),
    );

    player.addTag("_umbrail_veil_in");
  }
}

toAllPlayers(umbral_veil, 2);
