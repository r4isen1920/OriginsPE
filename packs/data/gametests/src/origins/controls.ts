import { 
  Container, 
  Entity, 
  EntityInventoryComponent, 
  ItemLockMode, 
  ItemStack, 
  Player, 
  world 
} from "@minecraft/server";

/** Entity query options for finding inventory keeper entities */
const INVENTORY_KEEP_QUERY = {
  type: 'r4isen1920_originspe:inventory_keep'
} as const;

/**
 * Returns the ability control tags for the player
 */
export function getControlTags(player: Player): string[] {
  return player.getTags().filter(tag => tag.startsWith('control_'));
}

/**
 * Gets the inventory keeper entity for the player's hotbar
 */
function getHotbarKeeperEntity(player: Player): Entity | undefined {
  const tags = [`_inventory_keep_${player.id}`, '_inventory_keep_hotbar'];
  const entities = player.dimension.getEntities({ 
    ...INVENTORY_KEEP_QUERY, 
    tags 
  });
  
  if (entities.length > 0) {
    entities[0].teleport(player.location, { dimension: player.dimension });
    return entities[0];
  }
  return undefined;
}

/**
 * Gets the container from an entity's inventory component
 */
function getEntityContainer(entity: Entity): Container | undefined {
  const component = entity.getComponent('inventory') as EntityInventoryComponent | undefined;
  return component?.container;
}

/**
 * Creates a locked item for the ability hotbar
 */
function createLockedItem(itemId: string): ItemStack {
  const item = new ItemStack(itemId);
  item.lockMode = ItemLockMode.slot;
  return item;
}

/**
 * Opens the ability hotbar for the player
 */
export function openAbilityHotbar(player: Player): void {
  const playerInventory = getEntityContainer(player);
  if (!playerInventory) return;

  // Store current hotbar items in dummy entity
  let dummyEntity = getHotbarKeeperEntity(player);
  if (!dummyEntity) {
    dummyEntity = player.dimension.spawnEntity(
      'r4isen1920_originspe:inventory_keep', 
      player.location
    );
    dummyEntity.addTag(`_inventory_keep_${player.id}`);
    dummyEntity.addTag('_inventory_keep_hotbar');
  }

  const dummyEntityInventory = getEntityContainer(dummyEntity);
  if (!dummyEntityInventory) return;

  // Save hotbar items to dummy entity and replace with padding
  const paddingItem = createLockedItem('r4isen1920_originspe:origins_menu_padding');
  for (let i = 0; i < 8; i++) {
    const hotbarItem = playerInventory.getItem(i);
    dummyEntityInventory.setItem(i, hotbarItem);
    playerInventory.setItem(i, paddingItem);
  }

  // Build ability controls from player tags
  const abilityControls: (ItemStack | undefined)[] = new Array(8).fill(undefined);
  const playerControlTags = getControlTags(player);

  for (const tag of playerControlTags) {
    const powerName = tag.replace('control_', '').replace('-hold', '');
    const itemName = `r4isen1920_originspe:origins_power.${powerName}`;

    try {
      const abilityItem = createLockedItem(itemName);
      // Find next available slot (0-6, slot 7 is reserved for submenu)
      const nextSlot = abilityControls.findIndex((item, idx) => idx < 7 && item === undefined);
      if (nextSlot !== -1) {
        abilityControls[nextSlot] = abilityItem;
      }
    } catch (e) {
      console.warn(`[r4isen1920][OriginsPE] Failed to load ability control item: '${itemName}' for ${player.name}`);
      console.warn(`[r4isen1920][OriginsPE] ${e}`);
    }
  }

  // Always add submenu button at slot 7
  abilityControls[7] = createLockedItem('r4isen1920_originspe:origins_submenu');

  // Apply ability controls to player hotbar
  for (let i = 0; i < 8; i++) {
    if (abilityControls[i]) {
      playerInventory.setItem(i, abilityControls[i]);
    }
  }

  // Show appropriate action bar message
  const actionBarKey = playerControlTags.length > 0 
    ? 'origins.hud.ability_hotbar_label:origins.ability_controls.info.usage'
    : 'origins.hud.ability_hotbar_label:origins.ability_controls.info.none';
  player.onScreenDisplay.setActionBar(actionBarKey);

  player.addTag('controls_opened');
  world.gameRules.showTags = false;
}

/**
 * Closes the ability hotbar for the player
 */
export function closeAbilityHotbar(player: Player): void {
  const playerInventory = getEntityContainer(player);
  if (!playerInventory) return;

  // Clear ability hotbar items
  for (let i = 0; i < 8; i++) {
    playerInventory.setItem(i, undefined);
  }

  // Restore hotbar items from dummy entity
  const dummyEntity = getHotbarKeeperEntity(player);
  if (!dummyEntity) {
    player.removeTag('controls_opened');
    return;
  }

  const dummyEntityInventory = getEntityContainer(dummyEntity);
  if (!dummyEntityInventory) {
    player.removeTag('controls_opened');
    return;
  }

  // Restore saved hotbar items
  for (let i = 0; i < 8; i++) {
    const savedItem = dummyEntityInventory.getItem(i);
    playerInventory.setItem(i, savedItem);
  }

  dummyEntity.triggerEvent('r4isen1920_originspe:instant_despawn');

  player.onScreenDisplay.setActionBar('origins.clear');
  player.removeTag('controls_opened');
  world.gameRules.showTags = false;
}
