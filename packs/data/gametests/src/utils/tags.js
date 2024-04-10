
/**
 * 
 * @author
 * r4isen1920
 * 
 * @remarks
 * Removes player tags that starts with
 * specified prefix and returns the tags
 * that were removed
 * 
 * @param { import("@minecraft/server").Entity } entity 
 * @param { string } prefix 
 * 
 * @returns { string[] }
 */
export function removeTags(entity, prefix) {
  const removedTags = entity.getTags().filter((tag) => tag.startsWith(prefix));
  removedTags.forEach((tag) => entity.removeTag(tag));
  return removedTags;
}
