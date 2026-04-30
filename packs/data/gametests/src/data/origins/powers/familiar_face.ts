
import { Player } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";


function familiar_face(player: Player) {

  if (!player.hasTag('power_familiar_face')) return;

  player.triggerEvent('r4isen1920_originspe:family_type.enderman');

}

toAllPlayers(familiar_face, 3);
