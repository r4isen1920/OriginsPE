import { system } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { _SCOREBOARD, ResourceBar } from "../../../origins/resource_bar";
import { removeTags } from "../../../utils/tags";

const BAR_LEVELS = [
	0,
	15,
	29,
	43,
	57,
	71,
	85,
	100
];

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function reconvene(player) {
	if (!player.hasTag('power_reconvene')) return;

	const reconveneTags = player.getTags().filter(tag => tag.includes('reconvene_stacks_') && !tag.includes('_was'));
	if (reconveneTags.length > 1) removeTags(player, 'reconvene_stacks_');

	if (reconveneTags.length > 1 || reconveneTags.length === 0) {
		changeReconveneStack(player, 0)
	}

	// Get current level from tags
	const currentLevelTag = reconveneTags[0] || 'reconvene_stacks_7';
	const currentLevel = parseInt(currentLevelTag.split('_').pop());

	// Handle transitions between levels
	if (player.hasTag(`_was_reconvene_stacks_${currentLevel + 1}`)) {
		onDecrementReconveneStack(player, currentLevel);
	} else if (player.hasTag(`_was_reconvene_stacks_${currentLevel - 1}`) ||
		(currentLevel === 7 && player.hasTag('_was_reconvene_stacks_0'))) {
		onIncrementReconveneStack(player, currentLevel);
	} else {
		initializeResourceBar(player, currentLevel);
	}
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { number } level 
 */
function initializeResourceBar(player, level) {
	if (!player.hasTag('_init_bar') && _SCOREBOARD('gui').getScore(player) === 1) {
		new ResourceBar(25, BAR_LEVELS[level], BAR_LEVELS[level], 1, true).push(player);
		player.addTag('_init_bar')
	}
}

toAllPlayers(reconvene, 3)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } level 
 */
export function changeReconveneStack(player, level) {
	const levelClamped = Math.min(Math.max(Number(level), 0), 7);
	const removedTags = removeTags(player, 'reconvene_stacks')
	player.addTag(`reconvene_stacks_${levelClamped}`)
	if (removedTags.length > 0) player.addTag(`_was_${removedTags[0]}`)
}

export function incrementReconveneStack(player) {
   const reconveneTags = player.getTags().filter(tag => tag.includes('reconvene_stacks_'));
   const currentLevel = reconveneTags.length > 0 ? parseInt(reconveneTags[0].replace('reconvene_stacks_', '')) : 0;
   changeReconveneStack(player, currentLevel + 1);
}

export function decrementReconveneStack(player) {
   const reconveneTags = player.getTags().filter(tag => tag.includes('reconvene_stacks_'));
   const currentLevel = reconveneTags.length > 0 ? parseInt(reconveneTags[0].replace('reconvene_stacks_', '')) : 0;
   changeReconveneStack(player, currentLevel - 1);
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } level 
 */
function onIncrementReconveneStack(player, level) {

	removeTags(player, '_was_reconvene_stacks');

	new ResourceBar(25, BAR_LEVELS[Number(level) - 1], BAR_LEVELS[Number(level)], 1, true)
		.push(player)

}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } level 
 */
function onDecrementReconveneStack(player, level) {

	removeTags(player, '_was_reconvene_stacks');

	new ResourceBar(25, BAR_LEVELS[Number(level) + 1], BAR_LEVELS[Number(level)], 1, true)
		.push(player)

}
