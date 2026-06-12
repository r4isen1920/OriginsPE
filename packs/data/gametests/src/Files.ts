export const enum Entities {
    Allay = "minecraft:allay",
    Armadillo = "minecraft:armadillo",
    Arrow = "minecraft:arrow",
    Axolotl = "minecraft:axolotl",
    Bat = "minecraft:bat",
    Bee = "minecraft:bee",
    Blaze = "minecraft:blaze",
    Bogged = "minecraft:bogged",
    Breeze = "minecraft:breeze",
    BreezeWindChargeProjectile = "minecraft:breeze_wind_charge_projectile",
    Camel = "minecraft:camel",
    Cat = "minecraft:cat",
    CaveSpider = "minecraft:cave_spider",
    Chicken = "minecraft:chicken",
    ClericAreaEffectCloud = "r4isen1920_originspe:cleric_area_effect_cloud",
    ClericLingeringPotion = "r4isen1920_originspe:cleric_lingering_potion",
    ClericSplashPotion = "r4isen1920_originspe:cleric_splash_potion",
    Cod = "minecraft:cod",
    Cow = "minecraft:cow",
    Creeper = "minecraft:creeper",
    DialogueHandler = "r4isen1920_originspe:dialogue_handler",
    Dolphin = "minecraft:dolphin",
    Donkey = "minecraft:donkey",
    Drowned = "minecraft:drowned",
    ElderGuardian = "minecraft:elder_guardian",
    ElvenArrow = "r4isen1920_originspe:elven_arrow",
    EnderDragon = "minecraft:ender_dragon",
    Enderman = "minecraft:enderman",
    Endermite = "minecraft:endermite",
    EvocationIllager = "minecraft:evocation_illager",
    Fox = "minecraft:fox",
    Frog = "minecraft:frog",
    Ghast = "minecraft:ghast",
    GlowSquid = "minecraft:glow_squid",
    Goat = "minecraft:goat",
    Guardian = "minecraft:guardian",
    Hoglin = "minecraft:hoglin",
    Horse = "minecraft:horse",
    HugeExplosion = "r4isen1920_originspe:huge_explosion",
    Husk = "minecraft:husk",
    InventoryKeep = "r4isen1920_originspe:inventory_keep",
    IronGolem = "minecraft:iron_golem",
    KnockbackRoar = "r4isen1920_originspe:knockback_roar",
    Llama = "minecraft:llama",
    MagmaCube = "minecraft:magma_cube",
    Mooshroom = "minecraft:mooshroom",
    Mule = "minecraft:mule",
    Ocelot = "minecraft:ocelot",
    OminousItemSpawner = "minecraft:ominous_item_spawner",
    OreHighlight = "r4isen1920_originspe:ore_highlight",
    Panda = "minecraft:panda",
    Parrot = "minecraft:parrot",
    Phantom = "minecraft:phantom",
    Pig = "minecraft:pig",
    Piglin = "minecraft:piglin",
    PiglinBrute = "minecraft:piglin_brute",
    Pillager = "minecraft:pillager",
    Player = "minecraft:player",
    PolarBear = "minecraft:polar_bear",
    Pufferfish = "minecraft:pufferfish",
    Rabbit = "minecraft:rabbit",
    Ravager = "minecraft:ravager",
    SafeTeleporter = "r4isen1920_originspe:safe_teleporter",
    Salmon = "minecraft:salmon",
    Sheep = "minecraft:sheep",
    ShootingStar = "r4isen1920_originspe:shooting_star",
    Shulker = "minecraft:shulker",
    Silverfish = "minecraft:silverfish",
    Skeleton = "minecraft:skeleton",
    SkeletonHorse = "minecraft:skeleton_horse",
    Slime = "minecraft:slime",
    Sniffer = "minecraft:sniffer",
    SnowGolem = "minecraft:snow_golem",
    Spider = "minecraft:spider",
    Squid = "minecraft:squid",
    Stray = "minecraft:stray",
    Strider = "minecraft:strider",
    Tadpole = "minecraft:tadpole",
    TraderLlama = "minecraft:trader_llama",
    Tropicalfish = "minecraft:tropicalfish",
    Turtle = "minecraft:turtle",
    VeinMiner = "r4isen1920_originspe:vein_miner",
    Vex = "minecraft:vex",
    Villager = "minecraft:villager",
    VillagerV2 = "minecraft:villager_v2",
    Vindicator = "minecraft:vindicator",
    VineBind = "r4isen1920_originspe:vine_bind",
    WanderingTrader = "minecraft:wandering_trader",
    Warden = "minecraft:warden",
    WebbingAttack = "r4isen1920_originspe:webbing_attack",
    WindChargeProjectile = "minecraft:wind_charge_projectile",
    Witch = "minecraft:witch",
    Wither = "minecraft:wither",
    WitherSkeleton = "minecraft:wither_skeleton",
    Wolf = "minecraft:wolf",
    Zoglin = "minecraft:zoglin",
    Zombie = "minecraft:zombie",
    ZombieHorse = "minecraft:zombie_horse",
    ZombiePigman = "minecraft:zombie_pigman",
    ZombieVillager = "minecraft:zombie_villager",
    ZombieVillagerV2 = "minecraft:zombie_villager_v2",
}

export namespace EntityProperties {

    export const enum Armadillo {
        /**
         * Type: enum
         * Default: unrolled
         * Client sync: true
         */
        ArmadilloState = "minecraft:armadillo_state",
    }

    export const enum Arrow {
        /**
         * Type: bool
         * Default: false
         * Client sync: true
         */
        IsImbued = "r4isen1920_originspe:is_imbued",
    }

    export const enum Bee {
        /**
         * Type: bool
         * Default: query.had_component_group('has_nectar')
         * Client sync: true
         */
        HasNectar = "minecraft:has_nectar",
    }

    export const enum Breeze {
        /**
         * Type: bool
         * Default: false
         * Client sync: false
         */
        IsPlayingIdleGroundSound = "minecraft:is_playing_idle_ground_sound",
    }

    export const enum Chicken {
        /**
         * Type: enum
         * Default: temperate
         * Client sync: true
         */
        ClimateVariant = "minecraft:climate_variant",
    }

    export const enum Cow {
        /**
         * Type: enum
         * Default: temperate
         * Client sync: true
         */
        ClimateVariant = "minecraft:climate_variant",
    }

    export const enum Pig {
        /**
         * Type: enum
         * Default: temperate
         * Client sync: true
         */
        ClimateVariant = "minecraft:climate_variant",
    }

    export const enum Player {
        /**
         * Type: enum
         * Default: none
         * Client sync: true
         */
        EmitterType = "r4isen1920_originspe:emitter_type",
        /**
         * Type: bool
         * Default: false
         * Client sync: true
         */
        FlagA = "r4isen1920_originspe:flag_a",
        /**
         * Type: bool
         * Default: false
         * Client sync: true
         */
        FlagB = "r4isen1920_originspe:flag_b",
        /**
         * Type: bool
         * Default: false
         * Client sync: true
         */
        FlagC = "r4isen1920_originspe:flag_c",
        /**
         * Type: bool
         * Default: false
         * Client sync: true
         */
        FlagD = "r4isen1920_originspe:flag_d",
        /**
         * Type: enum
         * Default: normal
         * Client sync: true
         */
        ModelType = "r4isen1920_originspe:model_type",
        /**
         * Type: enum
         * Default: normal
         * Client sync: true
         */
        SkinType = "r4isen1920_originspe:skin_type",
        /**
         * Type: bool
         * Default: true
         * Client sync: true
         */
        ToggleParticles = "r4isen1920_originspe:toggle_particles",
    }

    export const enum Wolf {
        /**
         * Type: bool
         * Default: false
         * Client sync: false
         */
        HasIncreasedMaxHealth = "minecraft:has_increased_max_health",
        /**
         * Type: bool
         * Default: false
         * Client sync: false
         */
        IsArmorable = "minecraft:is_armorable",
        /**
         * Type: enum
         * Default: default
         * Client sync: true
         */
        SoundVariant = "minecraft:sound_variant",
    }

    export const enum OreHighlight {
        /**
         * Type: bool
         * Default: false
         * Client sync: true
         */
        IsVisible = "r4isen1920_originspe:is_visible",
    }

    export const enum VineBind {
        /**
         * Type: int
         * Default: 0
         * Client sync: true
         * Range: [0,32]
         */
        Length = "r4isen1920_originspe:length",
        /**
         * Type: enum
         * Default: staying
         * Client sync: true
         */
        State = "r4isen1920_originspe:state",
    }

}

export const enum Items {
    BlacksmithDiamondAxe = "r4isen1920_originspe:blacksmith_diamond_axe",
    BlacksmithDiamondBoots = "r4isen1920_originspe:blacksmith_diamond_boots",
    BlacksmithDiamondChestplate = "r4isen1920_originspe:blacksmith_diamond_chestplate",
    BlacksmithDiamondHelmet = "r4isen1920_originspe:blacksmith_diamond_helmet",
    BlacksmithDiamondHoe = "r4isen1920_originspe:blacksmith_diamond_hoe",
    BlacksmithDiamondLeggings = "r4isen1920_originspe:blacksmith_diamond_leggings",
    BlacksmithDiamondPickaxe = "r4isen1920_originspe:blacksmith_diamond_pickaxe",
    BlacksmithDiamondShovel = "r4isen1920_originspe:blacksmith_diamond_shovel",
    BlacksmithDiamondSword = "r4isen1920_originspe:blacksmith_diamond_sword",
    BlacksmithGoldenAxe = "r4isen1920_originspe:blacksmith_golden_axe",
    BlacksmithGoldenBoots = "r4isen1920_originspe:blacksmith_golden_boots",
    BlacksmithGoldenChestplate = "r4isen1920_originspe:blacksmith_golden_chestplate",
    BlacksmithGoldenHelmet = "r4isen1920_originspe:blacksmith_golden_helmet",
    BlacksmithGoldenHoe = "r4isen1920_originspe:blacksmith_golden_hoe",
    BlacksmithGoldenLeggings = "r4isen1920_originspe:blacksmith_golden_leggings",
    BlacksmithGoldenPickaxe = "r4isen1920_originspe:blacksmith_golden_pickaxe",
    BlacksmithGoldenShovel = "r4isen1920_originspe:blacksmith_golden_shovel",
    BlacksmithGoldenSword = "r4isen1920_originspe:blacksmith_golden_sword",
    BlacksmithIronAxe = "r4isen1920_originspe:blacksmith_iron_axe",
    BlacksmithIronBoots = "r4isen1920_originspe:blacksmith_iron_boots",
    BlacksmithIronChestplate = "r4isen1920_originspe:blacksmith_iron_chestplate",
    BlacksmithIronHelmet = "r4isen1920_originspe:blacksmith_iron_helmet",
    BlacksmithIronHoe = "r4isen1920_originspe:blacksmith_iron_hoe",
    BlacksmithIronLeggings = "r4isen1920_originspe:blacksmith_iron_leggings",
    BlacksmithIronPickaxe = "r4isen1920_originspe:blacksmith_iron_pickaxe",
    BlacksmithIronShovel = "r4isen1920_originspe:blacksmith_iron_shovel",
    BlacksmithIronSword = "r4isen1920_originspe:blacksmith_iron_sword",
    BlacksmithLeatherBoots = "r4isen1920_originspe:blacksmith_leather_boots",
    BlacksmithLeatherChestplate = "r4isen1920_originspe:blacksmith_leather_chestplate",
    BlacksmithLeatherHelmet = "r4isen1920_originspe:blacksmith_leather_helmet",
    BlacksmithLeatherLeggings = "r4isen1920_originspe:blacksmith_leather_leggings",
    BlacksmithNetheriteAxe = "r4isen1920_originspe:blacksmith_netherite_axe",
    BlacksmithNetheriteBoots = "r4isen1920_originspe:blacksmith_netherite_boots",
    BlacksmithNetheriteChestplate = "r4isen1920_originspe:blacksmith_netherite_chestplate",
    BlacksmithNetheriteHelmet = "r4isen1920_originspe:blacksmith_netherite_helmet",
    BlacksmithNetheriteHoe = "r4isen1920_originspe:blacksmith_netherite_hoe",
    BlacksmithNetheriteLeggings = "r4isen1920_originspe:blacksmith_netherite_leggings",
    BlacksmithNetheritePickaxe = "r4isen1920_originspe:blacksmith_netherite_pickaxe",
    BlacksmithNetheriteShovel = "r4isen1920_originspe:blacksmith_netherite_shovel",
    BlacksmithNetheriteSword = "r4isen1920_originspe:blacksmith_netherite_sword",
    BlacksmithStoneAxe = "r4isen1920_originspe:blacksmith_stone_axe",
    BlacksmithStoneHoe = "r4isen1920_originspe:blacksmith_stone_hoe",
    BlacksmithStonePickaxe = "r4isen1920_originspe:blacksmith_stone_pickaxe",
    BlacksmithStoneShovel = "r4isen1920_originspe:blacksmith_stone_shovel",
    BlacksmithStoneSword = "r4isen1920_originspe:blacksmith_stone_sword",
    BlacksmithWoodenAxe = "r4isen1920_originspe:blacksmith_wooden_axe",
    BlacksmithWoodenHoe = "r4isen1920_originspe:blacksmith_wooden_hoe",
    BlacksmithWoodenPickaxe = "r4isen1920_originspe:blacksmith_wooden_pickaxe",
    BlacksmithWoodenShovel = "r4isen1920_originspe:blacksmith_wooden_shovel",
    BlacksmithWoodenSword = "r4isen1920_originspe:blacksmith_wooden_sword",
    ClericLingeringPotionOfFireResistanceLong = "r4isen1920_originspe:cleric_lingering_potion_of_fire_resistance_long",
    ClericLingeringPotionOfInvisibilityLong = "r4isen1920_originspe:cleric_lingering_potion_of_invisibility_long",
    ClericLingeringPotionOfLeapingLong = "r4isen1920_originspe:cleric_lingering_potion_of_leaping_long",
    ClericLingeringPotionOfLeapingPotent = "r4isen1920_originspe:cleric_lingering_potion_of_leaping_potent",
    ClericLingeringPotionOfNightVisionLong = "r4isen1920_originspe:cleric_lingering_potion_of_night_vision_long",
    ClericLingeringPotionOfPoisonLong = "r4isen1920_originspe:cleric_lingering_potion_of_poison_long",
    ClericLingeringPotionOfPoisonPotent = "r4isen1920_originspe:cleric_lingering_potion_of_poison_potent",
    ClericLingeringPotionOfRegenerationLong = "r4isen1920_originspe:cleric_lingering_potion_of_regeneration_long",
    ClericLingeringPotionOfRegenerationPotent = "r4isen1920_originspe:cleric_lingering_potion_of_regeneration_potent",
    ClericLingeringPotionOfSlowFallingLong = "r4isen1920_originspe:cleric_lingering_potion_of_slow_falling_long",
    ClericLingeringPotionOfSlownessLong = "r4isen1920_originspe:cleric_lingering_potion_of_slowness_long",
    ClericLingeringPotionOfSlownessPotent = "r4isen1920_originspe:cleric_lingering_potion_of_slowness_potent",
    ClericLingeringPotionOfStrengthLong = "r4isen1920_originspe:cleric_lingering_potion_of_strength_long",
    ClericLingeringPotionOfStrengthPotent = "r4isen1920_originspe:cleric_lingering_potion_of_strength_potent",
    ClericLingeringPotionOfSwiftnessLong = "r4isen1920_originspe:cleric_lingering_potion_of_swiftness_long",
    ClericLingeringPotionOfSwiftnessPotent = "r4isen1920_originspe:cleric_lingering_potion_of_swiftness_potent",
    ClericLingeringPotionOfTurtleMasterLong = "r4isen1920_originspe:cleric_lingering_potion_of_turtle_master_long",
    ClericLingeringPotionOfTurtleMasterPotent = "r4isen1920_originspe:cleric_lingering_potion_of_turtle_master_potent",
    ClericLingeringPotionOfWaterBreathingLong = "r4isen1920_originspe:cleric_lingering_potion_of_water_breathing_long",
    ClericLingeringPotionOfWeaknessLong = "r4isen1920_originspe:cleric_lingering_potion_of_weakness_long",
    ClericPotionOfFireResistanceLong = "r4isen1920_originspe:cleric_potion_of_fire_resistance_long",
    ClericPotionOfHarmingPotent = "r4isen1920_originspe:cleric_potion_of_harming_potent",
    ClericPotionOfHealingPotent = "r4isen1920_originspe:cleric_potion_of_healing_potent",
    ClericPotionOfInvisibilityLong = "r4isen1920_originspe:cleric_potion_of_invisibility_long",
    ClericPotionOfLeapingLong = "r4isen1920_originspe:cleric_potion_of_leaping_long",
    ClericPotionOfLeapingPotent = "r4isen1920_originspe:cleric_potion_of_leaping_potent",
    ClericPotionOfNightVisionLong = "r4isen1920_originspe:cleric_potion_of_night_vision_long",
    ClericPotionOfPoisonLong = "r4isen1920_originspe:cleric_potion_of_poison_long",
    ClericPotionOfPoisonPotent = "r4isen1920_originspe:cleric_potion_of_poison_potent",
    ClericPotionOfRegenerationLong = "r4isen1920_originspe:cleric_potion_of_regeneration_long",
    ClericPotionOfRegenerationPotent = "r4isen1920_originspe:cleric_potion_of_regeneration_potent",
    ClericPotionOfSlowFallingLong = "r4isen1920_originspe:cleric_potion_of_slow_falling_long",
    ClericPotionOfSlownessLong = "r4isen1920_originspe:cleric_potion_of_slowness_long",
    ClericPotionOfSlownessPotent = "r4isen1920_originspe:cleric_potion_of_slowness_potent",
    ClericPotionOfStrengthLong = "r4isen1920_originspe:cleric_potion_of_strength_long",
    ClericPotionOfStrengthPotent = "r4isen1920_originspe:cleric_potion_of_strength_potent",
    ClericPotionOfSwiftnessLong = "r4isen1920_originspe:cleric_potion_of_swiftness_long",
    ClericPotionOfSwiftnessPotent = "r4isen1920_originspe:cleric_potion_of_swiftness_potent",
    ClericPotionOfTurtleMasterLong = "r4isen1920_originspe:cleric_potion_of_turtle_master_long",
    ClericPotionOfTurtleMasterPotent = "r4isen1920_originspe:cleric_potion_of_turtle_master_potent",
    ClericPotionOfWaterBreathingLong = "r4isen1920_originspe:cleric_potion_of_water_breathing_long",
    ClericPotionOfWeaknessLong = "r4isen1920_originspe:cleric_potion_of_weakness_long",
    ClericSplashPotionOfFireResistanceLong = "r4isen1920_originspe:cleric_splash_potion_of_fire_resistance_long",
    ClericSplashPotionOfHarmingPotent = "r4isen1920_originspe:cleric_splash_potion_of_harming_potent",
    ClericSplashPotionOfHealingPotent = "r4isen1920_originspe:cleric_splash_potion_of_healing_potent",
    ClericSplashPotionOfInvisibilityLong = "r4isen1920_originspe:cleric_splash_potion_of_invisibility_long",
    ClericSplashPotionOfLeapingLong = "r4isen1920_originspe:cleric_splash_potion_of_leaping_long",
    ClericSplashPotionOfLeapingPotent = "r4isen1920_originspe:cleric_splash_potion_of_leaping_potent",
    ClericSplashPotionOfNightVisionLong = "r4isen1920_originspe:cleric_splash_potion_of_night_vision_long",
    ClericSplashPotionOfPoisonLong = "r4isen1920_originspe:cleric_splash_potion_of_poison_long",
    ClericSplashPotionOfPoisonPotent = "r4isen1920_originspe:cleric_splash_potion_of_poison_potent",
    ClericSplashPotionOfRegenerationLong = "r4isen1920_originspe:cleric_splash_potion_of_regeneration_long",
    ClericSplashPotionOfRegenerationPotent = "r4isen1920_originspe:cleric_splash_potion_of_regeneration_potent",
    ClericSplashPotionOfSlowFallingLong = "r4isen1920_originspe:cleric_splash_potion_of_slow_falling_long",
    ClericSplashPotionOfSlownessLong = "r4isen1920_originspe:cleric_splash_potion_of_slowness_long",
    ClericSplashPotionOfSlownessPotent = "r4isen1920_originspe:cleric_splash_potion_of_slowness_potent",
    ClericSplashPotionOfStrengthLong = "r4isen1920_originspe:cleric_splash_potion_of_strength_long",
    ClericSplashPotionOfStrengthPotent = "r4isen1920_originspe:cleric_splash_potion_of_strength_potent",
    ClericSplashPotionOfSwiftnessLong = "r4isen1920_originspe:cleric_splash_potion_of_swiftness_long",
    ClericSplashPotionOfSwiftnessPotent = "r4isen1920_originspe:cleric_splash_potion_of_swiftness_potent",
    ClericSplashPotionOfTurtleMasterLong = "r4isen1920_originspe:cleric_splash_potion_of_turtle_master_long",
    ClericSplashPotionOfTurtleMasterPotent = "r4isen1920_originspe:cleric_splash_potion_of_turtle_master_potent",
    ClericSplashPotionOfWaterBreathingLong = "r4isen1920_originspe:cleric_splash_potion_of_water_breathing_long",
    ClericSplashPotionOfWeaknessLong = "r4isen1920_originspe:cleric_splash_potion_of_weakness_long",
    InchlingSugar = "r4isen1920_originspe:inchling_sugar",
    KitsuneSweetBerries = "r4isen1920_originspe:kitsune_sweet_berries",
    OrbOfOrigins = "r4isen1920_originspe:orb_of_origins",
    ResignationPaper = "r4isen1920_originspe:resignation_paper",
    SlimecicanSlimeBall = "r4isen1920_originspe:slimecican_slime_ball",
    TempBakedPotato = "r4isen1920_originspe:temp_baked_potato",
    TempBeetrootSoup = "r4isen1920_originspe:temp_beetroot_soup",
    TempBread = "r4isen1920_originspe:temp_bread",
    TempCookedBeef = "r4isen1920_originspe:temp_cooked_beef",
    TempCookedChicken = "r4isen1920_originspe:temp_cooked_chicken",
    TempCookedCod = "r4isen1920_originspe:temp_cooked_cod",
    TempCookedMutton = "r4isen1920_originspe:temp_cooked_mutton",
    TempCookedPorkchop = "r4isen1920_originspe:temp_cooked_porkchop",
    TempCookedRabbit = "r4isen1920_originspe:temp_cooked_rabbit",
    TempCookedSalmon = "r4isen1920_originspe:temp_cooked_salmon",
    TempDiamondAxe = "r4isen1920_originspe:temp_diamond_axe",
    TempDiamondBoots = "r4isen1920_originspe:temp_diamond_boots",
    TempDiamondChestplate = "r4isen1920_originspe:temp_diamond_chestplate",
    TempDiamondHelmet = "r4isen1920_originspe:temp_diamond_helmet",
    TempDiamondHoe = "r4isen1920_originspe:temp_diamond_hoe",
    TempDiamondLeggings = "r4isen1920_originspe:temp_diamond_leggings",
    TempDiamondPickaxe = "r4isen1920_originspe:temp_diamond_pickaxe",
    TempDiamondShovel = "r4isen1920_originspe:temp_diamond_shovel",
    TempDiamondSword = "r4isen1920_originspe:temp_diamond_sword",
    TempDriedKelp = "r4isen1920_originspe:temp_dried_kelp",
    TempGoldenAxe = "r4isen1920_originspe:temp_golden_axe",
    TempGoldenBoots = "r4isen1920_originspe:temp_golden_boots",
    TempGoldenChestplate = "r4isen1920_originspe:temp_golden_chestplate",
    TempGoldenHelmet = "r4isen1920_originspe:temp_golden_helmet",
    TempGoldenHoe = "r4isen1920_originspe:temp_golden_hoe",
    TempGoldenLeggings = "r4isen1920_originspe:temp_golden_leggings",
    TempGoldenPickaxe = "r4isen1920_originspe:temp_golden_pickaxe",
    TempGoldenShovel = "r4isen1920_originspe:temp_golden_shovel",
    TempGoldenSword = "r4isen1920_originspe:temp_golden_sword",
    TempIronAxe = "r4isen1920_originspe:temp_iron_axe",
    TempIronBoots = "r4isen1920_originspe:temp_iron_boots",
    TempIronChestplate = "r4isen1920_originspe:temp_iron_chestplate",
    TempIronHelmet = "r4isen1920_originspe:temp_iron_helmet",
    TempIronHoe = "r4isen1920_originspe:temp_iron_hoe",
    TempIronLeggings = "r4isen1920_originspe:temp_iron_leggings",
    TempIronPickaxe = "r4isen1920_originspe:temp_iron_pickaxe",
    TempIronShovel = "r4isen1920_originspe:temp_iron_shovel",
    TempIronSword = "r4isen1920_originspe:temp_iron_sword",
    TempLeatherBoots = "r4isen1920_originspe:temp_leather_boots",
    TempLeatherChestplate = "r4isen1920_originspe:temp_leather_chestplate",
    TempLeatherHelmet = "r4isen1920_originspe:temp_leather_helmet",
    TempLeatherLeggings = "r4isen1920_originspe:temp_leather_leggings",
    TempLingeringPotionOfFireResistanceLong = "r4isen1920_originspe:temp_lingering_potion_of_fire_resistance_long",
    TempLingeringPotionOfInvisibilityLong = "r4isen1920_originspe:temp_lingering_potion_of_invisibility_long",
    TempLingeringPotionOfLeapingLong = "r4isen1920_originspe:temp_lingering_potion_of_leaping_long",
    TempLingeringPotionOfLeapingPotent = "r4isen1920_originspe:temp_lingering_potion_of_leaping_potent",
    TempLingeringPotionOfNightVisionLong = "r4isen1920_originspe:temp_lingering_potion_of_night_vision_long",
    TempLingeringPotionOfPoisonLong = "r4isen1920_originspe:temp_lingering_potion_of_poison_long",
    TempLingeringPotionOfPoisonPotent = "r4isen1920_originspe:temp_lingering_potion_of_poison_potent",
    TempLingeringPotionOfRegenerationLong = "r4isen1920_originspe:temp_lingering_potion_of_regeneration_long",
    TempLingeringPotionOfRegenerationPotent = "r4isen1920_originspe:temp_lingering_potion_of_regeneration_potent",
    TempLingeringPotionOfSlowFallingLong = "r4isen1920_originspe:temp_lingering_potion_of_slow_falling_long",
    TempLingeringPotionOfSlownessLong = "r4isen1920_originspe:temp_lingering_potion_of_slowness_long",
    TempLingeringPotionOfSlownessPotent = "r4isen1920_originspe:temp_lingering_potion_of_slowness_potent",
    TempLingeringPotionOfStrengthLong = "r4isen1920_originspe:temp_lingering_potion_of_strength_long",
    TempLingeringPotionOfStrengthPotent = "r4isen1920_originspe:temp_lingering_potion_of_strength_potent",
    TempLingeringPotionOfSwiftnessLong = "r4isen1920_originspe:temp_lingering_potion_of_swiftness_long",
    TempLingeringPotionOfSwiftnessPotent = "r4isen1920_originspe:temp_lingering_potion_of_swiftness_potent",
    TempLingeringPotionOfTurtleMasterLong = "r4isen1920_originspe:temp_lingering_potion_of_turtle_master_long",
    TempLingeringPotionOfTurtleMasterPotent = "r4isen1920_originspe:temp_lingering_potion_of_turtle_master_potent",
    TempLingeringPotionOfWaterBreathingLong = "r4isen1920_originspe:temp_lingering_potion_of_water_breathing_long",
    TempLingeringPotionOfWeaknessLong = "r4isen1920_originspe:temp_lingering_potion_of_weakness_long",
    TempMushroomStew = "r4isen1920_originspe:temp_mushroom_stew",
    TempNetheriteAxe = "r4isen1920_originspe:temp_netherite_axe",
    TempNetheriteBoots = "r4isen1920_originspe:temp_netherite_boots",
    TempNetheriteChestplate = "r4isen1920_originspe:temp_netherite_chestplate",
    TempNetheriteHelmet = "r4isen1920_originspe:temp_netherite_helmet",
    TempNetheriteHoe = "r4isen1920_originspe:temp_netherite_hoe",
    TempNetheriteLeggings = "r4isen1920_originspe:temp_netherite_leggings",
    TempNetheritePickaxe = "r4isen1920_originspe:temp_netherite_pickaxe",
    TempNetheriteShovel = "r4isen1920_originspe:temp_netherite_shovel",
    TempNetheriteSword = "r4isen1920_originspe:temp_netherite_sword",
    TempPotionOfFireResistanceLong = "r4isen1920_originspe:temp_potion_of_fire_resistance_long",
    TempPotionOfHarmingPotent = "r4isen1920_originspe:temp_potion_of_harming_potent",
    TempPotionOfHealingPotent = "r4isen1920_originspe:temp_potion_of_healing_potent",
    TempPotionOfInvisibilityLong = "r4isen1920_originspe:temp_potion_of_invisibility_long",
    TempPotionOfLeapingLong = "r4isen1920_originspe:temp_potion_of_leaping_long",
    TempPotionOfLeapingPotent = "r4isen1920_originspe:temp_potion_of_leaping_potent",
    TempPotionOfNightVisionLong = "r4isen1920_originspe:temp_potion_of_night_vision_long",
    TempPotionOfPoisonLong = "r4isen1920_originspe:temp_potion_of_poison_long",
    TempPotionOfPoisonPotent = "r4isen1920_originspe:temp_potion_of_poison_potent",
    TempPotionOfRegenerationLong = "r4isen1920_originspe:temp_potion_of_regeneration_long",
    TempPotionOfRegenerationPotent = "r4isen1920_originspe:temp_potion_of_regeneration_potent",
    TempPotionOfSlowFallingLong = "r4isen1920_originspe:temp_potion_of_slow_falling_long",
    TempPotionOfSlownessLong = "r4isen1920_originspe:temp_potion_of_slowness_long",
    TempPotionOfSlownessPotent = "r4isen1920_originspe:temp_potion_of_slowness_potent",
    TempPotionOfStrengthLong = "r4isen1920_originspe:temp_potion_of_strength_long",
    TempPotionOfStrengthPotent = "r4isen1920_originspe:temp_potion_of_strength_potent",
    TempPotionOfSwiftnessLong = "r4isen1920_originspe:temp_potion_of_swiftness_long",
    TempPotionOfSwiftnessPotent = "r4isen1920_originspe:temp_potion_of_swiftness_potent",
    TempPotionOfTurtleMasterLong = "r4isen1920_originspe:temp_potion_of_turtle_master_long",
    TempPotionOfTurtleMasterPotent = "r4isen1920_originspe:temp_potion_of_turtle_master_potent",
    TempPotionOfWaterBreathingLong = "r4isen1920_originspe:temp_potion_of_water_breathing_long",
    TempPotionOfWeaknessLong = "r4isen1920_originspe:temp_potion_of_weakness_long",
    TempRabbitStew = "r4isen1920_originspe:temp_rabbit_stew",
    TempSplashPotionOfFireResistanceLong = "r4isen1920_originspe:temp_splash_potion_of_fire_resistance_long",
    TempSplashPotionOfHarmingPotent = "r4isen1920_originspe:temp_splash_potion_of_harming_potent",
    TempSplashPotionOfHealingPotent = "r4isen1920_originspe:temp_splash_potion_of_healing_potent",
    TempSplashPotionOfInvisibilityLong = "r4isen1920_originspe:temp_splash_potion_of_invisibility_long",
    TempSplashPotionOfLeapingLong = "r4isen1920_originspe:temp_splash_potion_of_leaping_long",
    TempSplashPotionOfLeapingPotent = "r4isen1920_originspe:temp_splash_potion_of_leaping_potent",
    TempSplashPotionOfNightVisionLong = "r4isen1920_originspe:temp_splash_potion_of_night_vision_long",
    TempSplashPotionOfPoisonLong = "r4isen1920_originspe:temp_splash_potion_of_poison_long",
    TempSplashPotionOfPoisonPotent = "r4isen1920_originspe:temp_splash_potion_of_poison_potent",
    TempSplashPotionOfRegenerationLong = "r4isen1920_originspe:temp_splash_potion_of_regeneration_long",
    TempSplashPotionOfRegenerationPotent = "r4isen1920_originspe:temp_splash_potion_of_regeneration_potent",
    TempSplashPotionOfSlowFallingLong = "r4isen1920_originspe:temp_splash_potion_of_slow_falling_long",
    TempSplashPotionOfSlownessLong = "r4isen1920_originspe:temp_splash_potion_of_slowness_long",
    TempSplashPotionOfSlownessPotent = "r4isen1920_originspe:temp_splash_potion_of_slowness_potent",
    TempSplashPotionOfStrengthLong = "r4isen1920_originspe:temp_splash_potion_of_strength_long",
    TempSplashPotionOfStrengthPotent = "r4isen1920_originspe:temp_splash_potion_of_strength_potent",
    TempSplashPotionOfSwiftnessLong = "r4isen1920_originspe:temp_splash_potion_of_swiftness_long",
    TempSplashPotionOfSwiftnessPotent = "r4isen1920_originspe:temp_splash_potion_of_swiftness_potent",
    TempSplashPotionOfTurtleMasterLong = "r4isen1920_originspe:temp_splash_potion_of_turtle_master_long",
    TempSplashPotionOfTurtleMasterPotent = "r4isen1920_originspe:temp_splash_potion_of_turtle_master_potent",
    TempSplashPotionOfWaterBreathingLong = "r4isen1920_originspe:temp_splash_potion_of_water_breathing_long",
    TempSplashPotionOfWeaknessLong = "r4isen1920_originspe:temp_splash_potion_of_weakness_long",
    TempStoneAxe = "r4isen1920_originspe:temp_stone_axe",
    TempStoneHoe = "r4isen1920_originspe:temp_stone_hoe",
    TempStonePickaxe = "r4isen1920_originspe:temp_stone_pickaxe",
    TempStoneShovel = "r4isen1920_originspe:temp_stone_shovel",
    TempStoneSword = "r4isen1920_originspe:temp_stone_sword",
    TempWoodenAxe = "r4isen1920_originspe:temp_wooden_axe",
    TempWoodenHoe = "r4isen1920_originspe:temp_wooden_hoe",
    TempWoodenPickaxe = "r4isen1920_originspe:temp_wooden_pickaxe",
    TempWoodenShovel = "r4isen1920_originspe:temp_wooden_shovel",
    TempWoodenSword = "r4isen1920_originspe:temp_wooden_sword",
    UneatableApple = "r4isen1920_originspe:uneatable_apple",
    UneatableBakedPotato = "r4isen1920_originspe:uneatable_baked_potato",
    UneatableBeetroot = "r4isen1920_originspe:uneatable_beetroot",
    UneatableBeetrootSoup = "r4isen1920_originspe:uneatable_beetroot_soup",
    UneatableBread = "r4isen1920_originspe:uneatable_bread",
    UneatableCarrot = "r4isen1920_originspe:uneatable_carrot",
    UneatableChicken = "r4isen1920_originspe:uneatable_chicken",
    UneatableChorusFruit = "r4isen1920_originspe:uneatable_chorus_fruit",
    UneatableCod = "r4isen1920_originspe:uneatable_cod",
    UneatableCookedChicken = "r4isen1920_originspe:uneatable_cooked_chicken",
    UneatableCookedCod = "r4isen1920_originspe:uneatable_cooked_cod",
    UneatableCookedMutton = "r4isen1920_originspe:uneatable_cooked_mutton",
    UneatableCookedPorkchop = "r4isen1920_originspe:uneatable_cooked_porkchop",
    UneatableCookedRabbit = "r4isen1920_originspe:uneatable_cooked_rabbit",
    UneatableCookedSalmon = "r4isen1920_originspe:uneatable_cooked_salmon",
    UneatableCookie = "r4isen1920_originspe:uneatable_cookie",
    UneatableDriedKelp = "r4isen1920_originspe:uneatable_dried_kelp",
    UneatableEnchantedGoldenApple = "r4isen1920_originspe:uneatable_enchanted_golden_apple",
    UneatableGlowBerries = "r4isen1920_originspe:uneatable_glow_berries",
    UneatableGoldenApple = "r4isen1920_originspe:uneatable_golden_apple",
    UneatableGoldenCarrot = "r4isen1920_originspe:uneatable_golden_carrot",
    UneatableMelonSlice = "r4isen1920_originspe:uneatable_melon_slice",
    UneatableMushroomStew = "r4isen1920_originspe:uneatable_mushroom_stew",
    UneatableMutton = "r4isen1920_originspe:uneatable_mutton",
    UneatablePoisonousPotato = "r4isen1920_originspe:uneatable_poisonous_potato",
    UneatablePorkchop = "r4isen1920_originspe:uneatable_porkchop",
    UneatablePotato = "r4isen1920_originspe:uneatable_potato",
    UneatablePufferfish = "r4isen1920_originspe:uneatable_pufferfish",
    UneatablePumpkinPie = "r4isen1920_originspe:uneatable_pumpkin_pie",
    UneatableRabbit = "r4isen1920_originspe:uneatable_rabbit",
    UneatableRottenFlesh = "r4isen1920_originspe:uneatable_rotten_flesh",
    UneatableSalmon = "r4isen1920_originspe:uneatable_salmon",
    UneatableSpiderEye = "r4isen1920_originspe:uneatable_spider_eye",
    UneatableSteak = "r4isen1920_originspe:uneatable_steak",
    UneatableSweetBerries = "r4isen1920_originspe:uneatable_sweet_berries",
    UneatableTropicalFish = "r4isen1920_originspe:uneatable_tropical_fish",
}

export const enum Blocks {
    FakeCobweb = "r4isen1920_originspe:fake_cobweb",
}

export const enum Sounds {
    EnchantSweepingEdgeHit = "enchant.sweeping_edge.hit",
    EnchantThornsHit = "enchant.thorns.hit",
    EnderEyeDead = "ender_eye.dead",
    OriginsElvenUnlink = "origins.elven.unlink",
    OriginsStarborneCast = "origins.starborne.cast",
    OriginsStarborneLeap = "origins.starborne.leap",
    OriginsStarborneLeapDirect = "origins.starborne.leap_direct",
    RandomCook = "random.cook",
    TotemShieldBreak = "totem_shield.break",
    TotemShieldDeactivate = "totem_shield.deactivate",
    UiEnchant = "ui.enchant",
    UiWoodClick = "ui.wood_click",
}

export const enum LootTables {
    BlocksAcaciaLog = "blocks/acacia_log",
    BlocksBirchLog = "blocks/birch_log",
    BlocksDarkOakLog = "blocks/dark_oak_log",
    BlocksJungleLog = "blocks/jungle_log",
    BlocksOakLog = "blocks/oak_log",
    BlocksSpruceLog = "blocks/spruce_log",
    EntitiesWitherBoss = "entities/wither_boss",
    GameplayFarmingBeetrootTwice = "gameplay/farming/beetroot_twice",
    GameplayFarmingCarrotsTwice = "gameplay/farming/carrots_twice",
    GameplayFarmingPotatoesTwice = "gameplay/farming/potatoes_twice",
    GameplayFarmingWheatTwice = "gameplay/farming/wheat_twice",
}

export const enum Particles {
    AccuracyOnHit = "r4isen1920_originspe:accuracy_on_hit",
    AirBurst = "r4isen1920_originspe:air_burst",
    AirLaunch = "r4isen1920_originspe:air_launch",
    BeastmasterOnTame = "r4isen1920_originspe:beastmaster_on_tame",
    BeePoisonSting = "r4isen1920_originspe:bee_poison_sting",
    BeePoisonStingBonus = "r4isen1920_originspe:bee_poison_sting_bonus",
    BeePollinate = "r4isen1920_originspe:bee_pollinate",
    BlacksmithsDig = "r4isen1920_originspe:blacksmiths_dig",
    BlacksmithsHarvest = "r4isen1920_originspe:blacksmiths_harvest",
    BlazeAura = "r4isen1920_originspe:blaze_aura",
    BlazeImpact = "r4isen1920_originspe:blaze_impact",
    Bubbles = "r4isen1920_originspe:bubbles",
    ClericLingeringPotionFireResistance = "r4isen1920_originspe:cleric_lingering_potion_fire_resistance",
    ClericLingeringPotionInvisibility = "r4isen1920_originspe:cleric_lingering_potion_invisibility",
    ClericLingeringPotionJumpBoost = "r4isen1920_originspe:cleric_lingering_potion_jump_boost",
    ClericLingeringPotionNightVision = "r4isen1920_originspe:cleric_lingering_potion_night_vision",
    ClericLingeringPotionPoison = "r4isen1920_originspe:cleric_lingering_potion_poison",
    ClericLingeringPotionRegeneration = "r4isen1920_originspe:cleric_lingering_potion_regeneration",
    ClericLingeringPotionSlowFalling = "r4isen1920_originspe:cleric_lingering_potion_slow_falling",
    ClericLingeringPotionSlowness = "r4isen1920_originspe:cleric_lingering_potion_slowness",
    ClericLingeringPotionSpeed = "r4isen1920_originspe:cleric_lingering_potion_speed",
    ClericLingeringPotionStrength = "r4isen1920_originspe:cleric_lingering_potion_strength",
    ClericLingeringPotionTurtleMaster = "r4isen1920_originspe:cleric_lingering_potion_turtle_master",
    ClericLingeringPotionWaterBreathing = "r4isen1920_originspe:cleric_lingering_potion_water_breathing",
    ClericSplashBottleBreak = "r4isen1920_originspe:cleric_splash_bottle_break",
    ClericSplashPotionFireResistance = "r4isen1920_originspe:cleric_splash_potion_fire_resistance",
    ClericSplashPotionInstantDamage = "r4isen1920_originspe:cleric_splash_potion_instant_damage",
    ClericSplashPotionInstantHealth = "r4isen1920_originspe:cleric_splash_potion_instant_health",
    ClericSplashPotionInvisibility = "r4isen1920_originspe:cleric_splash_potion_invisibility",
    ClericSplashPotionJumpBoost = "r4isen1920_originspe:cleric_splash_potion_jump_boost",
    ClericSplashPotionNightVision = "r4isen1920_originspe:cleric_splash_potion_night_vision",
    ClericSplashPotionPoison = "r4isen1920_originspe:cleric_splash_potion_poison",
    ClericSplashPotionRegeneration = "r4isen1920_originspe:cleric_splash_potion_regeneration",
    ClericSplashPotionSlowFalling = "r4isen1920_originspe:cleric_splash_potion_slow_falling",
    ClericSplashPotionSlowness = "r4isen1920_originspe:cleric_splash_potion_slowness",
    ClericSplashPotionSpeed = "r4isen1920_originspe:cleric_splash_potion_speed",
    ClericSplashPotionStrength = "r4isen1920_originspe:cleric_splash_potion_strength",
    ClericSplashPotionTurtleMaster = "r4isen1920_originspe:cleric_splash_potion_turtle_master",
    ClericSplashPotionWaterBreathing = "r4isen1920_originspe:cleric_splash_potion_water_breathing",
    DivinerAura = "r4isen1920_originspe:diviner_aura",
    ElvenArrowTrail = "r4isen1920_originspe:elven_arrow_trail",
    ElvenAura = "r4isen1920_originspe:elven_aura",
    ElvenBowCharge = "r4isen1920_originspe:elven_bow_charge",
    ElvenBowImpact = "r4isen1920_originspe:elven_bow_impact",
    ElvenHeal = "r4isen1920_originspe:elven_heal",
    ExperienceTouch = "r4isen1920_originspe:experience_touch",
    PiglinDefenseUp = "r4isen1920_originspe:piglin_defense_up",
    PinpointOnHit = "r4isen1920_originspe:pinpoint_on_hit",
    PinpointOnShoot = "r4isen1920_originspe:pinpoint_on_shoot",
    PlayerInventory = "r4isen1920_originspe:player_inventory",
    PotionGrantFireResistance = "r4isen1920_originspe:potion_grant_fire_resistance",
    PotionGrantInvisibility = "r4isen1920_originspe:potion_grant_invisibility",
    PotionGrantJumpBoost = "r4isen1920_originspe:potion_grant_jump_boost",
    PotionGrantNightVision = "r4isen1920_originspe:potion_grant_night_vision",
    PotionGrantPoison = "r4isen1920_originspe:potion_grant_poison",
    PotionGrantRegeneration = "r4isen1920_originspe:potion_grant_regeneration",
    PotionGrantSlowFalling = "r4isen1920_originspe:potion_grant_slow_falling",
    PotionGrantSlowness = "r4isen1920_originspe:potion_grant_slowness",
    PotionGrantSpeed = "r4isen1920_originspe:potion_grant_speed",
    PotionGrantStrength = "r4isen1920_originspe:potion_grant_strength",
    PotionGrantWaterBreathing = "r4isen1920_originspe:potion_grant_water_breathing",
    PotionGrantWeakness = "r4isen1920_originspe:potion_grant_weakness",
    RingOfFire = "r4isen1920_originspe:ring_of_fire",
    RogueStealthOut = "r4isen1920_originspe:rogue_stealth_out",
    RootkinVineBreak = "r4isen1920_originspe:rootkin_vine_break",
    RootkinVineDespawn = "r4isen1920_originspe:rootkin_vine_despawn",
    RootkinVineDmgSpread = "r4isen1920_originspe:rootkin_vine_dmg_spread",
    RootkinVineSpawn = "r4isen1920_originspe:rootkin_vine_spawn",
    ShieldBreak = "r4isen1920_originspe:shield_break",
    ShulkInventory = "r4isen1920_originspe:shulk_inventory",
    SpaceAura = "r4isen1920_originspe:space_aura",
    SpaceTrail = "r4isen1920_originspe:space_trail",
    Star = "r4isen1920_originspe:star",
    StarLeapBase = "r4isen1920_originspe:star_leap_base",
    StarLeapStars = "r4isen1920_originspe:star_leap_stars",
    StarMeditate = "r4isen1920_originspe:star_meditate",
    StarProjectileAccent = "r4isen1920_originspe:star_projectile_accent",
    StarProjectileImpact = "r4isen1920_originspe:star_projectile_impact",
    StarProjectileStars = "r4isen1920_originspe:star_projectile_stars",
    StarProjectileTrail = "r4isen1920_originspe:star_projectile_trail",
    StarStress = "r4isen1920_originspe:star_stress",
    StarSupernova = "r4isen1920_originspe:star_supernova",
    VeinMine = "r4isen1920_originspe:vein_mine",
    VoidwalkerAura = "r4isen1920_originspe:voidwalker_aura",
    VoidwalkerBeelzebub0 = "r4isen1920_originspe:voidwalker_beelzebub_0",
    VoidwalkerBeelzebub1 = "r4isen1920_originspe:voidwalker_beelzebub_1",
    VoidwalkerBeelzebub2 = "r4isen1920_originspe:voidwalker_beelzebub_2",
    VoidwalkerBeelzebub3 = "r4isen1920_originspe:voidwalker_beelzebub_3",
    VoidwalkerBeelzebubPhase0 = "r4isen1920_originspe:voidwalker_beelzebub_phase_0",
    VoidwalkerBeelzebubPhase1 = "r4isen1920_originspe:voidwalker_beelzebub_phase_1",
    VoidwalkerBeelzebubPhase2 = "r4isen1920_originspe:voidwalker_beelzebub_phase_2",
    VoidwalkerBeelzebubPhase3 = "r4isen1920_originspe:voidwalker_beelzebub_phase_3",
    VoidwalkerBeelzebubPhase4 = "r4isen1920_originspe:voidwalker_beelzebub_phase_4",
    VoidwalkerSoulburst = "r4isen1920_originspe:voidwalker_soulburst",
    VoidwalkerVeil = "r4isen1920_originspe:voidwalker_veil",
    VoidwalkerVeilGround = "r4isen1920_originspe:voidwalker_veil_ground",
    WebbingPoof = "r4isen1920_originspe:webbing_poof",
    WebbingTrap = "r4isen1920_originspe:webbing_trap",
}

