import type { Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";

function swift(Player: Player) {
	if ( !Player.hasTag('power_swift') ) { return }

	Player.triggerEvent('r4isen1920_originspe:movement.0.15');
		
}

toAllPlayers(swift, 5)