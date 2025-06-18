import { world, system } from "@minecraft/server";

world.afterEvents.entityDie.subscribe((event) => {
    const player = event.deadEntity;
    
    // Check if the dead entity is a player
    if (!player || player.typeId !== 'minecraft:player') return;
    
    // Clear inventory on next tick
    system.runTimeout(() => {
        const inventory = player.getComponent('inventory');
        if (!inventory) return;
        
        const container = inventory.container;
        // Clear all inventory slots
        for (let i = 0; i < container.size; i++) {
            container.setItem(i, undefined);
        }
    }, 1);
});