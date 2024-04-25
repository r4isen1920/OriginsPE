
import { world, system, TicksPerSecond } from "@minecraft/server";

import { toAllPlayers } from "../../../origins/player";
import { removeTags } from "../../../utils/tags";


system.runTimeout(() => {

  world.afterEvents.entityHitEntity.subscribe(
    event => {

      const { damagingEntity, hitEntity } = event;
      if (
        damagingEntity.typeId !== 'minecraft:player' ||
        !damagingEntity.hasTag('power_prescience') ||

        hitEntity.typeId !== 'minecraft:player' ||
        hitEntity.hasTag('power_prescience') ||
        hitEntity.hasTag('_under_prescience')
      ) return

      const setId = damagingEntity.id;
      const allPlayerTags = findPlayersWithSameID(setId)

      //* Remove all existing players possessing the same ID
      allPlayerTags.forEach(player => {
        removePrescienceEffect(player, setId)
      })

      //* Add the player to the set
      damagingEntity.addTag(`_under_prescience`)
      damagingEntity.addTag(`_under_prescience_id_${setId}`)

      hitEntity.addTag(`_under_prescience`)
      hitEntity.addTag(`_under_prescience_id_${setId}`)
      hitEntity.triggerEvent('r4isen1920_originspe:has_divine_aura.true')

      //* Player effects
      world.playSound('ender_eye.dead', hitEntity.location, { volume: 1.5, pitch: 0.75 })

    }
  )

  world.afterEvents.entityDie.subscribe(
    event => {

      const { deadEntity } = event;
      if (
        deadEntity.typeId !== 'minecraft:player' ||
        deadEntity.hasTag('power_prescience') ||
        !deadEntity.hasTag('_under_prescience')
      ) return

      //* Dispell effect when the entity dies
      removePrescienceEffect(deadEntity)

    }
  )

}, TicksPerSecond * 7)

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function prescience(player) {
  if (!player.hasTag('_under_prescience')) return

  //* Checks if there's other players with the same tag ID as self
  const myID = player.getTags().find(tag => tag.startsWith('_under_prescience_id_'))
  const allPlayerTags = findPlayersWithSameID(myID)

  //* Dispell the effect if there are only self or no players online with the same ID as self
  if (allPlayerTags.length <= 1) removePrescienceEffect(player)

  //* Tally all players under the same ID their current total max HP
  const totalMaxHP = allPlayerTags.reduce((acc, cur) => acc + cur.getProperty('r4isen1920_originspe:definitive_max_health'), 0)

  //* Increase both players' max HP by up to 50% of the total max HP
  allPlayerTags.forEach(player => {
    // Note: `health_boost` status effect grants 4 additional hearts per 1 level, so account for that wisely //
    player.addEffect('health_boost', TicksPerSecond * 12, { amplifier: Math.floor((totalMaxHP * 0.5) / 4), showParticles: false })
  })

}

toAllPlayers(prescience, 6)

/**
 * 
 * @param { string | number } id 
 * @returns { import('@minecraft/server').Player[] }
 */
export function findPlayersWithSameID(id) {
  return world.getAllPlayers()
    .filter(player => (
      player.hasTag('_under_prescience') &&
      player.hasTag(`_under_prescience_id_${id.replace('_under_prescience_id_', '')}`)
    ))
}

/**
 * 
 * @param { import('@minecraft/server').Player } player 
 * @param { string | number } id 
 */
export function removePrescienceEffect(player, id=undefined) {

  console.warn(`remove effect from ${player.name}`)

  if (id !== undefined) {
    player.removeTag(`_under_prescience`)
    player.removeTag(`_under_prescience_id_${id}`)
  } else {
    removeTags(player, '_under_prescience')
  }

  player.triggerEvent('r4isen1920_originspe:has_divine_aura.false')

  //* Player effects
  world.playSound('respawn_anchor.deplete', player.location, { pitch: 1.75 })

}
