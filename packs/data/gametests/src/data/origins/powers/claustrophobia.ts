
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/vec3";
import { Player } from "@minecraft/server";


function claustrophobia(player: Player) {

  if (!player.hasTag('power_claustrophobia')) return;

  const block = player.dimension.getBlockFromRay(player.getHeadLocation(), new Vector3(0, 1, 0), { maxDistance: 4 })?.block;

  if (block === undefined) {
    player.setDynamicProperty(
      'r4isen1920_originspe:claustrophobia',
      Math.max(Number(player.getDynamicProperty('r4isen1920_originspe:claustrophobia') || 0) - 1, 0)
    );
  } else {
    player.setDynamicProperty(
      'r4isen1920_originspe:claustrophobia',
      Math.min(Number(player.getDynamicProperty('r4isen1920_originspe:claustrophobia') || 0) + 1, 200)
    );
  }

  const claustrophobiaLevel = Number(player.getDynamicProperty('r4isen1920_originspe:claustrophobia') || 0);
  if (claustrophobiaLevel < 150) {
    player.triggerEvent('r4isen1920_originspe:attack.1');
    player.triggerEvent('r4isen1920_originspe:movement.0.1');
  } else {
    player.triggerEvent('r4isen1920_originspe:attack.0');
    player.triggerEvent('r4isen1920_originspe:movement.0.05');
  }

}

toAllPlayers(claustrophobia, 2);
