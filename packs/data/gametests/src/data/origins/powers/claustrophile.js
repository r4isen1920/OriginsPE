import { world, system, TicksPerSecond } from "@minecraft/server";

const STRENGTH_EFFECT = "minecraft:strength";
const REGEN_EFFECT = "minecraft:regeneration";
const EFFECT_DURATION = TicksPerSecond * 2; // 2 seconds, refreshes every tick
const EFFECT_AMPLIFIER = 0; // Level 1

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (!player.hasTag("power_claustrophile")) continue;

    const y = Math.floor(player.location.y);

    // Remove effects first to prevent stacking
    player.removeEffect(STRENGTH_EFFECT);
    player.removeEffect(REGEN_EFFECT);

    if (y < 30) {
      // Underground: Give Strength and Regeneration
      player.addEffect(STRENGTH_EFFECT, EFFECT_DURATION, { amplifier: EFFECT_AMPLIFIER, showParticles: false });
      player.addEffect(REGEN_EFFECT, EFFECT_DURATION, { amplifier: EFFECT_AMPLIFIER, showParticles: false });
    } else if (y > 60) {
      // Above ground: Effects are removed (could add a penalty here if desired)
      // Example penalty: Weakness
      // player.addEffect("minecraft:weakness", EFFECT_DURATION, { amplifier: 0, showParticles: false });
    }
    // Between 30 and 60: No effects
  }
}, TicksPerSecond); // Check every second