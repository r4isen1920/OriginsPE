
// Origins.
import './domain/origins/Human';
import './domain/origins/Arachnid';


// Classes.
import './domain/classes/Nitwit';
import './domain/classes/Warrior';


// Powers.
import './domain/powers/MasterOfWebs';
import './domain/powers/Webbing';
import './domain/powers/Fragile';
import './domain/powers/Climbing';
import './domain/powers/HighJump';
import './domain/powers/Carnivore';


// Perks.
import './domain/perks/BetterStew';
import './domain/perks/LongerPotions';
import './domain/perks/MoreSaturatedFood';
import './domain/perks/PowerfulPotions';
import './domain/perks/QualityEquipment';
import './domain/perks/LessHealthMoreAttack';



import './core/Commands';
import { Ticker } from './core/Ticker';
Ticker.start();

import { installDecoratedEventSubscribers } from './core/DecoratedEvents';
installDecoratedEventSubscribers();

import './domain/PlayerLifecycle';
import './domain/ItemEvents';
import { lockAllDomainRegistries } from './domain/Registries';

import './services/DamageService';
import { ResourceBarService } from './services/ResourceBarService';

import { system } from '@minecraft/server';

import { OnWorldLoad, init as initStylish } from '@bedrock-oss/stylish';
initStylish();

import { Log } from './utils/Log';
import Meta from './Meta';
const log = Log.get('Main');

class Bootstrap {
	@OnWorldLoad
	static onWorldLoad(): void {
		lockAllDomainRegistries();
		ResourceBarService.initialize();
		log.info('OriginsPE world bootstrap complete');
	}
}
void Bootstrap;

log.info(`OriginsPE running on build ${Meta.github.commit} (${Meta.github.tag})`);
