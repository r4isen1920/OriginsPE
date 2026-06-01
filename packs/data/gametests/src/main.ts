//* Origins
import './domain/origins/Human';
import './domain/origins/Avian';
import './domain/origins/Arachnid';
import './domain/origins/Elytrian';
import './domain/origins/Shulk';
import './domain/origins/Feline';
import './domain/origins/Enderian';
import './domain/origins/Merling';
import './domain/origins/Blazeborn';
import './domain/origins/Phantom';
import './domain/origins/Kitsune';
import './domain/origins/Slimecican';
import './domain/origins/Inchling';
import './domain/origins/Bee';
import './domain/origins/Starborne';
import './domain/origins/Piglin';
import './domain/origins/Elf';
import './domain/origins/Voidwalker';
import './domain/origins/Diviner';
import './domain/origins/Mole';
import './domain/origins/Rootkin';

//* Powers
import './domain/powers/BoastingFirepower';
import './domain/powers/Pride';
import './domain/powers/Gluttony';
import './domain/powers/HeavyPockets';
import './domain/powers/Courage';
import './domain/powers/MasterOfWebs';
import './domain/powers/Webbing';
import './domain/powers/Fragile';
import './domain/powers/Climbing';
import './domain/powers/HighJump';
import './domain/powers/Carnivore';
import './domain/powers/Tailwind';
import './domain/powers/SlowFalling';
import './domain/powers/Vegetarian';
import './domain/powers/FreshAir';
import './domain/powers/Fatality';
import './domain/powers/ShortLifespan';
import './domain/powers/Stingers';
import './domain/powers/Pollenate';
import './domain/powers/Diurnal';
import './domain/powers/Impervious';
import './domain/powers/NetherInhabitant';
import './domain/powers/Ember';
import './domain/powers/Hotblooded';
import './domain/powers/Hydrophobia';
import './domain/powers/Prescience';
import './domain/powers/Oracle';
import './domain/powers/Aegis';
import './domain/powers/DivineAura';
import './domain/powers/Fragility';
import './domain/powers/Instability';
import './domain/powers/Lifeweaver';
import './domain/powers/EndlessQuiver';
import './domain/powers/Imbue';
import './domain/powers/Swift';
import './domain/powers/Permeable';
import './domain/powers/GiftOfTheWinds';
import './domain/powers/Winged';
import './domain/powers/NeedForMobility';
import './domain/powers/Claustrophobia';
import './domain/powers/BrittleBones';
import './domain/powers/AerialCombatant';
import './domain/powers/Teleportation';
import './domain/powers/ScaredOfGourds';
import './domain/powers/FamiliarFace';
import './domain/powers/StrongAnkles';
import './domain/powers/Acrobatics';
import './domain/powers/NineLives';
import './domain/powers/Noctural';
import './domain/powers/WeakArms';
import './domain/powers/CatlikeAppearance';
import './domain/powers/Camouflage';
import './domain/powers/FastFooted';
import './domain/powers/Pounced';
import './domain/powers/BerryCraver';
import './domain/powers/SmallerHeart';
import './domain/powers/FastMetabolism';
import './domain/powers/Gills';
import './domain/powers/AquaAffinity';
import './domain/powers/SeaInhabitant';
import './domain/powers/LikeWater';
import './domain/powers/OceansGift';
//-------------------------------------------

//* Classes
import './domain/classes/Nitwit';
import './domain/classes/Archer';
import './domain/classes/Beastmaster';
import './domain/classes/Warrior';
import './domain/classes/Explorer';
import './domain/classes/Farmer';
import './domain/classes/Lumberjack';
import './domain/classes/Cook';
import './domain/classes/Merchant';
import './domain/classes/Miner';
import './domain/classes/Rancher';
import './domain/classes/Rogue';
import './domain/classes/Cleric';
import './domain/classes/Blacksmith';

//* Perks
import './domain/perks/Agility';
import './domain/perks/CheaperTrades';
import './domain/perks/WanderingTraderSpawn';
import './domain/perks/NoSprintExhaustion';
import './domain/perks/MoreBirths';
import './domain/perks/ShieldWield';
import './domain/perks/MoreAnimalLoot';
import './domain/perks/FastGrowCrop';
import './domain/perks/MoreCropsDrop';
import './domain/perks/Sneaky';
import './domain/perks/Stealth';
import './domain/perks/Replanting';
import './domain/perks/MoreSaturatedFood';
import './domain/perks/GreatCraftsmanship';
import './domain/perks/ExplorerKit';
import './domain/perks/TreeCapitator';
import './domain/perks/OreVeinMiner';
import './domain/perks/FaunaFriends';
import './domain/perks/Precision';
import './domain/perks/BetterStew';
import './domain/perks/LongerPotions';
import './domain/perks/PowerfulPotions';
import './domain/perks/QualityEquipment';
import './domain/perks/LessHealthMoreAttack';
import './domain/perks/NoMiningExhaustion';
import './domain/perks/EffectiveEmphaty';

//-------------------------------------------

import './core/Commands';
import './core/Ticker';

import './ui/UiEventRouter';
import './utils/Version';

import { installDecoratedEventSubscribers } from './core/DecoratedEvents';
installDecoratedEventSubscribers();

import './domain/PlayerLifecycle';
import './domain/ItemEvents';
import './domain/Registries';

import './services/DamageService';
import './services/AbilityEventService';
import './services/ResourceBarService';

import { init } from '@bedrock-oss/stylish';
init();
