
/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Removes player tags specified
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { string } prefix 
 */
export function removeTags(entity, prefix) {
  entity.getTags().filter((tag) => tag.startsWith(prefix)).forEach((tag) => entity.removeTag(tag));
}
