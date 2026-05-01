
import { ItemStack, TicksPerSecond, world, Player } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { findItem } from "../../../utils/items";


function berry_craver(player: Player) {

  let targetBerry;
  let convertTo;

  if (player.hasTag('power_berry_craver')) {
    targetBerry = findItem(player, 'minecraft:sweet_berries');
    convertTo = 'r4isen1920_originspe:kitsune_sweet_berries';
  } else {
    targetBerry = findItem(player, 'r4isen1920_originspe:kitsune_sweet_berries');
    convertTo = 'minecraft:sweet_berries';
  }

  if (!targetBerry) return;

  const inventory = player.getComponent('inventory');
  if (!inventory?.container) return;

  const amount = targetBerry.item?.amount ?? 1;
  inventory.container.setItem(targetBerry.slot, new ItemStack(convertTo, amount));

}

world.afterEvents.itemCompleteUse.subscribe(event => {
	const { itemStack, source } = event;
	if (
		!itemStack.typeId.includes('sweet_berries') ||
		!source.hasTag('power_berry_craver')
	) return;

	const chance = 10 / 100;
	if (Math.random() < chance) {
		source.addEffect('minecraft:regeneration', TicksPerSecond * 10, {
			amplifier: 1
		});
	}

});

toAllPlayers(berry_craver, 3);
