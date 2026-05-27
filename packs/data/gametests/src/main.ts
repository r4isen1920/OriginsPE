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
import './domain/powers/MasterOfWebs';
import './domain/powers/Webbing';
import './domain/powers/Fragile';
import './domain/powers/Climbing';
import './domain/powers/HighJump';
import './domain/powers/Carnivore';
import './domain/powers/Tail_wind';
import './domain/powers/Slow_falling';
import './domain/powers/Vegetarian';
import './domain/powers/Fresh_air';
import './domain/powers/Fatality';
import './domain/powers/Short_lifespan';
import './domain/powers/Stingers';
import './domain/powers/Pollenate';
import './domain/powers/Diurnal';
import './domain/powers/Impervious';
import './domain/powers/Nether_inhabitant';
import './domain/powers/Ember';
import './domain/powers/Hotblooded';
import './domain/powers/Hydrophobia';
import './domain/powers/Prescience';
import './domain/powers/Oracle';
import './domain/powers/Aegis';
import './domain/powers/Divine_Aura';
import './domain/powers/Fragility';
import './domain/powers/Instability';
import './domain/powers/Lifeweaver';
import './domain/powers/Endless_quiver';
import './domain/powers/Imbue';
import './domain/powers/Swift';
import './domain/powers/Permeable';
import './domain/powers/Gift_of_the_winds';
import './domain/powers/Winged';
import './domain/powers/Need_For_Mobility';
import './domain/powers/Claustrophobia';
import './domain/powers/Brittle_bones';
import './domain/powers/Aerial_combatant';
import './domain/powers/Teleportation';
import './domain/powers/Scared_Of_Grounds';
import './domain/powers/Familiar_face';
import './domain/powers/Strong_ankles';
import './domain/powers/Acrobatics';
import './domain/powers/Nine_lives';
import './domain/powers/Noctural';
import './domain/powers/Weak_arms';
import './domain/powers/Catlike_appearance';
import './domain/powers/Camouflage';
import './domain/powers/Fast_footed';
import './domain/powers/Pounced';
import './domain/powers/Berry_craver';
import './domain/powers/Smaller_heart';
import './domain/powers/Fast_metabolism';
import './domain/powers/Gills';
import './domain/powers/Aqua_affinity';
import './domain/powers/Sea_inhabitant';
import './domain/powers/Like_water';
import './domain/powers/Oceans_gift';
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
import './domain/perks/NoSprintExhaustion';
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

import { installDecoratedEventSubscribers } from './core/DecoratedEvents';
installDecoratedEventSubscribers();

import './domain/PlayerLifecycle';
import './domain/ItemEvents';
import './domain/Registries';

import './services/DamageService';
import './services/ResourceBarService';

import { init } from '@bedrock-oss/stylish';
init();
