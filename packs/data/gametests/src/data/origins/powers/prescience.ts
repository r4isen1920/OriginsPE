//prescience.ts
import { world, system, TicksPerSecond, Player } from "@minecraft/server";

import { toAllPlayers, getCachedPlayers } from "../../../origins/player";
import { removeTags } from "../../../utils/tags";


system.runTimeout(() => {
  world.afterEvents.entityHitEntity.subscribe((event) => {
    const { damagingEntity, hitEntity } = event;
    if (
      damagingEntity.typeId !== "minecraft:player" ||
      !damagingEntity.hasTag("power_prescience") ||
      hitEntity.typeId !== "minecraft:player" ||
      hitEntity.hasTag("power_prescience") ||
      hitEntity.hasTag("_under_prescience")
    )
      return;

    const setId = damagingEntity.id;
    const allPlayerTags = findPlayersWithSameID(setId);

    allPlayerTags.forEach((player: Player) => {
      removePrescienceEffect(player, setId);
    });

    damagingEntity.addTag(`_under_prescience`);
    damagingEntity.addTag(`_under_prescience_id_${setId}`);

    hitEntity.addTag(`_under_prescience`);
    hitEntity.addTag(`_under_prescience_id_${setId}`);
    hitEntity.triggerEvent("r4isen1920_originspe:has_divine_aura.true");

    (world as any).playSound("ender_eye.dead", hitEntity.location, {
      volume: 1.5,
      pitch: 0.75,
    });
  });

  world.afterEvents.entityDie.subscribe((event) => {
    const { deadEntity } = event;
    if (
      deadEntity.typeId !== "minecraft:player" ||
      deadEntity.hasTag("power_prescience") ||
      !deadEntity.hasTag("_under_prescience")
    )
      return;

    const myID = deadEntity
      .getTags()
      .find((tag) => tag.startsWith("_under_prescience_id_"));
    removePrescienceEffect(deadEntity as Player, myID as any);
  });
}, TicksPerSecond * 7);

function prescience(player: Player): void {
  if (!player.hasTag("_under_prescience")) return;

  const myID = player
    .getTags()
    .find((tag) => tag.startsWith("_under_prescience_id_"));
  const allPlayerTags = findPlayersWithSameID(myID as any);

  if (allPlayerTags.length <= 1)
    removePrescienceEffect(player as Player, myID as any);

  const totalMaxHP = allPlayerTags.reduce((acc, cur) => {
    const value = cur.getProperty("r4isen1920_originspe:definitive_max_health");
    const numValue = typeof value === "number" ? value : Number(value) || 0;
    return acc + numValue;
  }, 0);

  allPlayerTags.forEach((targetPlayer) => {
    targetPlayer.addEffect("health_boost", TicksPerSecond * 12, {
      amplifier: Math.floor((totalMaxHP * 0.5) / 4),
      showParticles: false,
    });
  });
}

toAllPlayers(prescience, 6);

export function findPlayersWithSameID(id: string | number) {
  return getCachedPlayers()
    .filter(
      (player) =>
        player.hasTag("_under_prescience") &&
        player.hasTag(
          `_under_prescience_id_${id.toString().replace("_under_prescience_id_", "")}`,
        ),
    );
}

export function removePrescienceEffect(player: Player, id: string | number) {
  console.warn(`remove effect from ${player.name}`);

  if (id !== undefined) {
    player.removeTag(`_under_prescience`);
    player.removeTag(`_under_prescience_id_${id}`);
  } else {
    removeTags(player, "_under_prescience");
  }

  player.triggerEvent("r4isen1920_originspe:has_divine_aura.false");

  player.playSound("respawn_anchor.deplete", { pitch: 1.75 });
}
