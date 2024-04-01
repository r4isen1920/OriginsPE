
import { world } from "@minecraft/server";

world.afterEvents.playerSpawn.subscribe(
  event => {

    const { initialSpawn, player } = event;

    if (!initialSpawn) return

    player.sendMessage('initialized')

  }
)
