
import { system, TicksPerSecond, WeatherType, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";


system.runTimeout(() => {

  world.afterEvents.weatherChange.subscribe(
    event => {

      const { dimension, newWeather } = event;
      const players = world.getDimension(dimension).getPlayers({ tags: [ 'power_nighttime' ] });
      if (players.length === 0) return;

      if (newWeather === WeatherType.Clear) {
        players.forEach(player => {
          player.removeTag('_nighttime_raining')
        })
      } else {
        players.forEach(player => {
          player.addTag('_nighttime_raining')
        })
      }

    }
  )

}, 4)


/**
 * 
 * @param { import('@minecraft/server').Player } player 
 */
function nighttime(player) {
  if (!player.hasTag('power_nighttime')) return

  const isNightTime = world.getTimeOfDay() >= 12000 && world.getTimeOfDay() <= 22813;

  if (isNightTime || player.hasTag('_nighttime_raining')) {
    player.addEffect('weakness', TicksPerSecond * 12, { amplifier: 1, showParticles: false });
    player.addEffect('slowness', TicksPerSecond * 12, { amplifier: 1, showParticles: false });
  }

}

toAllPlayers(nighttime, 4)
