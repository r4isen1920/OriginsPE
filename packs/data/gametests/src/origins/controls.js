
import { ItemLockMode, ItemStack, world } from "@minecraft/server";


/**
 * 
 * Returns the ability control tags for the player
 * 
 * @param { import('@minecraft/server').Player } player 
 * @returns { string[] }
 */
export function getControlTags(player) {
  return player.getTags()?.filter(tag => tag.startsWith('control_')) || [];
}

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

  player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}`, '_inventory_keep_hotbar' ] })[0]
                  ?.teleport(player.location, { dimension: player.dimension })

  const dummyEntity = 
    player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}`, '_inventory_keep_hotbar' ] })[0] ||
    player.dimension.spawnEntity('r4isen1920_originspe:inventory_keep', player.location);
  /**
   * @type { import('@minecraft/server').Container }
   */                    
  const dummyEntityInventory = dummyEntity.getComponent('inventory').container;

  for (let i = 0; i < 8; i++) {
    _HOTBAR.push(playerInventory.getItem(i));

    const itemPadding = new ItemStack('r4isen1920_originspe:origins_menu_padding');
    itemPadding.lockMode = ItemLockMode.slot;
    playerInventory.setItem(i, itemPadding)
  }

  _HOTBAR.forEach((item, index) => {
    dummyEntityInventory.setItem(index, item)
  })

  dummyEntity.addTag(`_inventory_keep_${player.id}`)
  dummyEntity.addTag('_inventory_keep_hotbar')


  // To: Ability hotbar items

  const playerControlTags = getControlTags(player);
  if (playerControlTags?.length > 0) {

    playerControlTags.forEach(tag => {
      const itemName = `r4isen1920_originspe:origins_power.${tag.replace('control_', '').replace('-hold', '')}`;

      try {
        const item = new ItemStack(itemName);
        item.lockMode = ItemLockMode.slot;

        _ABILITY_CONTROLS.push(item) 
      } catch (e) {
        console.warn(`[r4isen1920][OriginsPE] Failed to load ability control item: '${itemName}' for ${player.name}`);
        console.warn(`[r4isen1920][OriginsPE] ${e}`);
      }
    })

  };

  _ABILITY_CONTROLS[7] = new ItemStack('r4isen1920_originspe:origins_submenu');
  _ABILITY_CONTROLS[7].lockMode = ItemLockMode.slot;

  _ABILITY_CONTROLS.forEach((item, index) => {
    playerInventory.setItem(index, item)
  })

  if (playerControlTags?.length > 0) player.onScreenDisplay.setActionBar('origins.hud.ability_hotbar_label:origins.ability_controls.info.usage');
  else player.onScreenDisplay.setActionBar('origins.hud.ability_hotbar_label:origins.ability_controls.info.none');

  player.addTag('controls_opened');

  world.gameRules.showTags = false;


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

  player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}`, '_inventory_keep_hotbar' ] })[0]
                  ?.teleport(player.location, { dimension: player.dimension })

  const dummyEntity = player.dimension.getEntities({ type: 'r4isen1920_originspe:inventory_keep', tags: [ `_inventory_keep_${player.id}`, '_inventory_keep_hotbar' ] })[0]
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

  player.onScreenDisplay.setActionBar('origins.clear');

  player.removeTag('controls_opened');

  world.gameRules.showTags = false;

}
