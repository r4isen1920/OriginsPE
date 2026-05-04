//soulburst.ts

import {
	getBeelzebubProperty,
	incrementBeelzebubProperty,
} from "./beelzebub.js";
import { Vec3 } from "@bedrock-oss/bedrock-boost";
import type { Player } from "@minecraft/server";

export function soulburst(attacker: Player, hurtEntity: Player): void {
	if (getBeelzebubProperty(attacker) < 3 || attacker.hasTag("cooldown_20"))
		return;

	attacker.runCommand(
		`damage @e[tag="_beelzebub_target_${attacker.id}",c=1] ${Math.ceil(getBeelzebubProperty(attacker, "dmg"))}`,
	);

	incrementBeelzebubProperty(attacker, "phase", -3);
	incrementBeelzebubProperty(
		attacker,
		"dmg",
		-1 * getBeelzebubProperty(attacker, "dmg"),
	);

	hurtEntity.dimension.playSound("ender_eye.dead", hurtEntity.location, {
		volume: 2.0,
	});

	hurtEntity.dimension.spawnParticle(
		"r4isen1920_originspe:voidwalker_soulburst",
		Vec3.from(hurtEntity.location).add(Vec3.from(0, 1, 0)),
	);
	attacker.dimension.spawnParticle(
		"r4isen1920_originspe:voidwalker_beelzebub_phase_4",
		Vec3.from(attacker.getHeadLocation()).add(
			Vec3.from(attacker.getViewDirection()).scale(1.75),
		),
	);

	hurtEntity.removeTag(`_beelzebub_target_${attacker.id}`);
}
