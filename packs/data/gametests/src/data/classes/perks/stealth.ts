//stealth.ts
import { TicksPerSecond } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { type Player } from "@minecraft/server";

function stealth(player: Player): void {
  if (!player.hasTag("perk_stealth")) return;

  if (player.getEffect("invisibility") !== undefined) {
    player.addEffect("strength", TicksPerSecond * 3, {
      amplifier: 0,
      showParticles: false,
    });
  }
}

toAllPlayers(stealth, 5);
