import { OnWorldLoad } from '@bedrock-oss/stylish';
import { Registry } from '../platform/Registry';
import { CharacterClass, Origin, Perk, Power } from './Ability';


//#region SINGLETONS

/** All registered origins, keyed by id. */
export const OriginRegistry = new Registry<Origin>('Origin');

/** All registered classes, keyed by id. */
export const ClassRegistry = new Registry<CharacterClass>('Class');

/** All registered powers, keyed by id. */
export const PowerRegistry = new Registry<Power>('Power');

/** All registered perks, keyed by id. */
export const PerkRegistry = new Registry<Perk>('Perk');


//#region DECORATORS

/** Class decorator: instantiates the class once and registers the singleton. */
export function RegisterOrigin<T extends new () => Origin>(ctor: T): T {
	OriginRegistry.register(new ctor());
	return ctor;
}

/** Class decorator: instantiates the class once and registers the singleton. */
export function RegisterClass<T extends new () => CharacterClass>(ctor: T): T {
	ClassRegistry.register(new ctor());
	return ctor;
}

/** Class decorator: instantiates the class once and registers the singleton. */
export function RegisterPower<T extends new () => Power>(ctor: T): T {
	PowerRegistry.register(new ctor());
	return ctor;
}

/** Class decorator: instantiates the class once and registers the singleton. */
export function RegisterPerk<T extends new () => Perk>(ctor: T): T {
	PerkRegistry.register(new ctor());
	return ctor;
}


//#region LOCK

/** Freezes every domain registry. Call once after all imports complete. */
class LockAllDomainRegistries {
	@OnWorldLoad
	static lockAllDomainRegistries(): void {
		OriginRegistry.lock();
		ClassRegistry.lock();
		PowerRegistry.lock();
		PerkRegistry.lock();
	}
}

