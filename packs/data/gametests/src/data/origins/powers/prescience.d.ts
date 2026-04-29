import type { Player } from "@minecraft/server";

export function findPlayersWithSameID(id: string | number): Player[];
export function removePrescienceEffect(player: Player, id?: string | number): void;
