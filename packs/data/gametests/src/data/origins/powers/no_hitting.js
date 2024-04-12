
import { system, world } from "@minecraft/server";

system.runTimeout(() => {

  world.afterEvents.entityHitEntity.subscribe(
    event => {
  
      const { hitEntity } = event;
      if (!hitEntity.hasTag('power_no_hitting') || hitEntity.typeId !== 'minecraft:player') return;
  
      if (Math.random() <= 0.1) {
  
        hitEntity.camera.fade({
          fadeColor: { red: 1, green: 1, blue: 1 },
          fadeTime: {
            fadeInTime: 0.1,
            fadeOutTime: 3,
            holdTime: 5
          }
        })
  
        hitEntity.addEffect('slowness', 4, { amplifier: 255, showParticles: false })
  
      }
    }
  )

}, 5)
