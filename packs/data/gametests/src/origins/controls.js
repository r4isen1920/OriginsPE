
import { ItemLockMode, ItemStack } from "@minecraft/server";


/**
 * 
 * Opens the ability hotbar for the player
 * 
 * @param { import('@minecraft/server').Player } player
 */
export function openAbilityHotbar(player) {
  /**
   * The old hotbar contents
   * @type { import('@minecraft/server').ItemStack[] }
   */
  let _HOTBAR = [];
  /**
   * The ability controls
   * @type { import('@minecraft/server').ItemStack[] }
   */
  let _ABILITY_CONTROLS = [];
  /**
   * @type { import('@minecraft/server').Container }
   */
  const playerInventory = player.getComponent('inventory').container;


  // From: Player hotbar items

  player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}` ] })[0]
                  ?.teleport(player.location, { dimension: player.dimension })

  const dummyEntity = 
    player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}` ] })[0] ||
    player.dimension.spawnEntity('r4isen1920_originspe:inventory_keep', player.location);
  /**
   * @type { import('@minecraft/server').Container }
   */                    
  const dummyEntityInventory = dummyEntity.getComponent('inventory').container;

  for (let i = 0; i < 8; i++) {
    _HOTBAR.push(playerInventory.getItem(i))
    playerInventory.setItem(i, undefined)
  }

  _HOTBAR.forEach((item, index) => {
    dummyEntityInventory.setItem(index, item)
  })

  dummyEntity.addTag(`_inventory_keep_${player.id}`)


  // To: Ability hotbar items

  const playerControlTags = player.getTags()?.filter(tag => tag.startsWith('control_'));
  if (playerControlTags?.length > 0) {

    playerControlTags.forEach(tag => {
      const itemName = `r4isen1920_originspe:origins_power.${tag.replace('control_', '')}`;
  
      try {
        const item = new ItemStack(itemName);
        item.lockMode = ItemLockMode.slot;
  
        _ABILITY_CONTROLS.push(item) 
      } catch (e) {
        console.warn(`[r4isen1920][OriginsPE] Failed to load ability control item ${itemName} for ${player.name}`);
        console.warn(`[r4isen1920][OriginsPE] ${e}`);
      }
    })

  };

  _ABILITY_CONTROLS[7] = new ItemStack('r4isen1920_originspe:origins_submenu');
  _ABILITY_CONTROLS[7].lockMode = ItemLockMode.slot;

  _ABILITY_CONTROLS.forEach((item, index) => {
    playerInventory.setItem(index, item)
  })

  player.addTag('controls_opened')


}

/**
 * 
 * Closes the ability hotbar for the player
 * 
 * @param { import('@minecraft/server').Player } player 
 */
export function closeAbilityHotbar(player) {
  /**
   * The old hotbar contents
   * @type { import('@minecraft/server').ItemStack[] }
   */
  let _HOTBAR = [];
  /**
   * @type { import('@minecraft/server').Container }
   */
  const playerInventory = player.getComponent('inventory').container;


  // From: Ability hotbar items

  for (let i = 0; i < 8; i++) {
    playerInventory.setItem(i, undefined)
  }


  // To: Player hotbar items

  player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}` ] })[0]
                  ?.teleport(player.location, { dimension: player.dimension })

  const dummyEntity = player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}` ] })[0]
  if (!dummyEntity) {
    player.removeTag('controls_opened')
    return
  };

  /**
   * @type { import('@minecraft/server').Container }
   */
  const dummyEntityInventory = dummyEntity.getComponent('inventory').container;

  for (let i = 0; i < 8; i++) {
    _HOTBAR.push(dummyEntityInventory.getItem(i))
  }

  _HOTBAR.forEach((item, index) => {
    playerInventory.setItem(index, item)
  })

  dummyEntity.triggerEvent('r4isen1920_originspe:instant_despawn')


  player.removeTag('controls_opened')

}
