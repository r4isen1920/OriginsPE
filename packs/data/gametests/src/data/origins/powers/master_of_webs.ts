import { Dimension, Entity, Player, system, world } from "@minecraft/server";
import { toAllPlayers } from "../../../origins/player";
import { Vector3 } from "../../../utils/Vec3";
import { removeTags } from "../../../utils/tags";

function master_of_webs(player: Player): void {
  const loc = player.location;
  const dim = player.dimension;

  const b0 = dim.getBlock(Vector3.add(loc, new Vector3(0, 0, 0)));
  const b1 = dim.getBlock(Vector3.add(loc, new Vector3(0, 1, 0)));

  player.runCommand(
    "fill ~10 ~10 ~10 ~-10 ~-10 ~-10 r4isen1920_originspe:fake_cobweb replace web",
  );
  player.getComponent("minecraft:inventory")?.container?.clearAll();

  if (player.hasTag("race_arachnid")) return;

  const inWebFeet =
    b0?.permutation.matches("r4isen1920_originspe:fake_cobweb") ?? false;
  const inWebHead =
    b1?.permutation.matches("r4isen1920_originspe:fake_cobweb") ?? false;

  if (inWebFeet || inWebHead) {
    player.addEffect("minecraft:slowness", 100, {
      amplifier: 2,
      showParticles: false,
    });

    if (inWebFeet && inWebHead) {
      player.addTag("_master_of_webs_1");
      player.removeTag("_master_of_webs_0");
    } else {
      player.addTag("_master_of_webs_0");
      player.removeTag("_master_of_webs_1");
    }
  } else {
    if (player.hasTag("_mow_slowed")) {
      player.removeEffect("minecraft:slowness");
      player.removeTag("_mow_slowed");
    }
    removeTags(player, "_master_of_webs");
  }
}

let dimension: Dimension | undefined = undefined;
let entities: Entity[] | undefined = undefined;

system.runInterval(() => {
  if (!dimension) {
    dimension = world.getDimension("overworld");
  }

  entities = dimension.getEntities();

  for (const entity of entities) {
    if (entity.typeId === "minecraft:player") {
      master_of_webs(entity as Player);
    }
  }
});
