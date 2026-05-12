
//* Origins
import './domain/origins/Human';
import './domain/origins/Arachnid';

//* Powers
import './domain/powers/MasterOfWebs';
import './domain/powers/Webbing';
import './domain/powers/Fragile';
import './domain/powers/Climbing';
import './domain/powers/HighJump';
import './domain/powers/Carnivore';

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
import './domain/classes/Blacksmith'

//* Perks
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
