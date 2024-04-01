
/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Removes player tags specified
 * 
 * @param { import("@minecraft/server").Player } player 
 * @param { string } tagStartsWith 
 * @param { boolean } showDebugMessage 
 * @returns void
 */
export function removeTags(player, tagStartsWith, showDebugMessage=true) {
  let playerTags = player.getTags().filter((tag) => tag.startsWith(tagStartsWith));
  if (playerTags.length < 1) return;

  for (const tag of playerTags) {
    player.removeTag(tag);
  }

  if (showDebugMessage && player.name == 'r4isen1920') player.sendMessage(`Removed ${playerTags.length} '${tagStartsWith}*' tags.`);

  return;
}
