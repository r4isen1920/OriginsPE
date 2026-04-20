import { Entity } from "@minecraft/server";

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
 * @param entity 
 * @param prefix 
 * 
 * @returns 
 */
export function removeTags(entity: Entity, prefix: string): string[] {
  const removedTags = entity.getTags().filter((tag) => tag.startsWith(prefix));
  removedTags.forEach((tag) => entity.removeTag(tag));
  return removedTags;
}
