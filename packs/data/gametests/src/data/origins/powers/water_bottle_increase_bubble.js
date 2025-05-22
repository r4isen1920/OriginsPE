import { TicksPerSecond, world } from "@minecraft/server";

export function water_bottle_increase_bubble(player) {
  if (!player.hasTag('power_water_bottle_increase_bubble')) return

  return 0;
}

world.afterEvents.itemCompleteUse.subscribe(event => {
	const itemStack = event.itemStack;
	const player = event.source;

	if (
		itemStack.typeId === 'minecraft:potion' &&
		player.hasTag('power_water_bottle_increase_bubble')
	) {
		player.addEffect('minecraft:water_breathing', TicksPerSecond * 1)
	}

})
