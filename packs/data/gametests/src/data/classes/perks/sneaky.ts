//sneaky.ts
import { type Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";

/**
 * 
 * Makes the player's name invisible to other players and mobs when they
 * have the "perk_sneaky" tag by triggering a custom event that is listened
 * to by a server-side addon that handles the actual invisibility logic
 * 
 */

function sneaky(player: Player): void {
  if (!player.hasTag("perk_sneaky")) return;

  player.triggerEvent("r4isen1920_originspe:display_name.false");
}

toAllPlayers(sneaky, 5);
