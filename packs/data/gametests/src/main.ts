
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
import './domain/classes/Warrior';

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
