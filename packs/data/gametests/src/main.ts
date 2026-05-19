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
import './domain/origins/Fox';
import './domain/origins/Slimecican';
import './domain/origins/Inchling';
import './domain/origins/Bee';
import './domain/origins/Starborne';
import './domain/origins/Piglin';
import './domain/origins/Elven';
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
import './domain/perks/ExplorerKit';
import './domain/perks/FaunaFriends';
import './domain/perks/Precision';
import './domain/perks/BetterStew';
import './domain/perks/LongerPotions';
import './domain/perks/MoreSaturatedFood';
import './domain/perks/PowerfulPotions';
import './domain/perks/QualityEquipment';
import './domain/perks/LessHealthMoreAttack';

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
