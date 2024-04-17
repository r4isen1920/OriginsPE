
import { world, system } from "@minecraft/server";

import { getBeelzebubProperty, incrementBeelzebubProperty } from "./beelzebub";
import { Vector3 } from "../../../utils/Vec3";

/**
 * 
 * @param { import('@minecraft/server').Player } attacker 
 * @param { import('@minecraft/server').Entity } hurtEntity 
 */
export function soulburst(attacker, hurtEntity) {

  if (
    getBeelzebubProperty(attacker) < 3 ||
    attacker.hasTag('cooldown_20')
  ) return;

  attacker.runCommand(`damage @e[tag="_beelzebub_target_${attacker.id}",c=1] ${Math.ceil(getBeelzebubProperty(attacker, 'dmg'))}`);

  incrementBeelzebubProperty(attacker, 'phase', -3);
  incrementBeelzebubProperty(attacker, 'dmg', -1 * getBeelzebubProperty(attacker, 'dmg'));

  world.playSound('ender_eye.dead', hurtEntity.location, { volume: 2.0 });

  hurtEntity.dimension.spawnParticle('r4isen1920_originspe:voidwalker_soulburst', Vector3.add(hurtEntity.location, new Vector3(0, 1, 0)))
  attacker.dimension.spawnParticle(
    'r4isen1920_originspe:voidwalker_beelzebub_phase_4',
    Vector3.add(
      attacker.getHeadLocation(),
      Vector3.multiply(attacker.getViewDirection(), 1.75)
    )
  )

  hurtEntity.removeTag(`_beelzebub_target_${attacker.id}`);

}
