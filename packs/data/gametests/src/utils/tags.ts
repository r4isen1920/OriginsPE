import { Entity } from "@minecraft/server";

export function removeTags(entity: Entity, prefix: string): string[] {
  const allTags = entity.getTags();

  if (allTags.length === 0) return [];

  const removedTags: string[] = [];

  for (const tag of allTags) {
    if (tag.startsWith(prefix)) {
      entity.removeTag(tag);
      removedTags.push(tag);
    }
  }

  return removedTags;
}