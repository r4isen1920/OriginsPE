import {
	world,
	system,
	WorldAfterEvents,
	WorldBeforeEvents,
	SystemAfterEvents,
	SystemBeforeEvents,
} from '@minecraft/server';
import { Logger } from '@bedrock-oss/bedrock-boost';

const log = Logger.getLogger('DecoratedEvents');

//#region Types
type EventSignalLike<Arg = any> = { subscribe(cb: (ev: Arg) => unknown): any };
type ExtractSubscribeArg<T> = T extends EventSignalLike<infer A> ? A : unknown;
type EventMethodDecorator<Arg> = (
	target: any,
	propertyKey: string | symbol,
	descriptor: TypedPropertyDescriptor<(ev: Arg) => unknown>,
) => void;
type EventDecoratorFactory<Arg> = {
	(): EventMethodDecorator<Arg>;
	(
		target: any,
		propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<(ev: Arg) => unknown>,
	): void;
};

//#region Registry
const handlers: Record<string, Array<(ev: any) => void>> = Object.create(null);
const subs: Record<string, { unsubscribe?: () => void } | void> =
	Object.create(null);

function register(
	containerName: string,
	eventKey: string,
	fn: (ev: any) => void,
) {
	const key = `${containerName}.${eventKey}`;
	(handlers[key] ??= []).push(fn);
}

//#region Factory
function makeFactory<C extends Record<string, any>>(
	container: C,
	containerName: string,
) {
	return <K extends keyof C & string>(
		eventKey: K,
	): EventDecoratorFactory<ExtractSubscribeArg<C[K]>> => {
		const core: EventMethodDecorator<ExtractSubscribeArg<C[K]>> = (
			target,
			_prop,
			desc,
		) => {
			const fn = desc?.value;
			if (typeof fn !== 'function') return;
			if (typeof target !== 'function') return;
			const signal = (container as any)?.[eventKey];
			if (!signal || typeof signal.subscribe !== 'function') {
				log.error(
					`${containerName}.${String(eventKey)} is not available`,
				);
				return;
			}
			register(containerName, String(eventKey), (ev: any) => {
				try {
					fn.call(target, ev);
				} catch (e: any) {
					log.error(e?.stack ?? e);
				}
			});
		};
		const decorator: any = (...a: any[]) =>
			a.length === 3 ? core(a[0], a[1], a[2]) : core;
		return decorator;
	};
}

const After = makeFactory<WorldAfterEvents>(world.afterEvents, 'After');
const Before = makeFactory<WorldBeforeEvents>(world.beforeEvents, 'Before');
const SystemBefore = makeFactory<SystemBeforeEvents>(
	system.beforeEvents,
	'SystemBefore',
);
const SystemAfter = makeFactory<SystemAfterEvents>(
	system.afterEvents,
	'SystemAfter',
);

//#region Exports
export const AfterBlockExplode = After('blockExplode');
export const AfterButtonPush = After('buttonPush');
export const AfterDataDrivenEntityTrigger = After('dataDrivenEntityTrigger');
export const AfterEffectAdd = After('effectAdd');
export const AfterEntityDie = After('entityDie');
export const AfterEntityHealthChanged = After('entityHealthChanged');
export const AfterEntityHitBlock = After('entityHitBlock');
export const AfterEntityHitEntity = After('entityHitEntity');
export const AfterEntityHurt = After('entityHurt');
export const AfterEntityLoad = After('entityLoad');
export const AfterEntityRemove = After('entityRemove');
export const AfterEntitySpawn = After('entitySpawn');
export const AfterExplosion = After('explosion');
export const AfterGameRuleChange = After('gameRuleChange');
export const AfterItemCompleteUse = After('itemCompleteUse');
export const AfterItemReleaseUse = After('itemReleaseUse');
export const AfterItemStartUse = After('itemStartUse');
export const AfterItemStartUseOn = After('itemStartUseOn');
export const AfterItemStopUse = After('itemStopUse');
export const AfterItemStopUseOn = After('itemStopUseOn');
export const AfterItemUse = After('itemUse');
export const AfterLeverAction = After('leverAction');
export const AfterPistonActivate = After('pistonActivate');
export const AfterPlayerBreakBlock = After('playerBreakBlock');
export const AfterPlayerButtonInput = After('playerButtonInput');
export const AfterPlayerDimensionChange = After('playerDimensionChange');
export const AfterPlayerEmote = After('playerEmote');
export const AfterPlayerGameModeChange = After('playerGameModeChange');
export const AfterPlayerHotbarSelectedSlotChange = After(
	'playerHotbarSelectedSlotChange',
);
export const AfterPlayerInputModeChange = After('playerInputModeChange');
export const AfterPlayerInputPermissionCategoryChange = After(
	'playerInputPermissionCategoryChange',
);
export const AfterPlayerInteractWithBlock = After('playerInteractWithBlock');
export const AfterPlayerInteractWithEntity = After('playerInteractWithEntity');
export const AfterPlayerInventoryItemChange = After(
	'playerInventoryItemChange',
);
export const AfterPlayerJoin = After('playerJoin');
export const AfterPlayerLeave = After('playerLeave');
export const AfterPlayerPlaceBlock = After('playerPlaceBlock');
export const AfterPlayerSpawn = After('playerSpawn');
export const AfterPressurePlatePop = After('pressurePlatePop');
export const AfterPressurePlatePush = After('pressurePlatePush');
export const AfterProjectileHitBlock = After('projectileHitBlock');
export const AfterProjectileHitEntity = After('projectileHitEntity');
export const AfterTargetBlockHit = After('targetBlockHit');
export const AfterTripWireTrip = After('tripWireTrip');
export const AfterWeatherChange = After('weatherChange');
export const AfterWorldLoadEvent = After('worldLoad');

export const BeforeEffectAdd = Before('effectAdd');
export const BeforeEntityRemove = Before('entityRemove');
export const BeforeExplosion = Before('explosion');
export const BeforeItemUse = Before('itemUse');
export const BeforePlayerBreakBlock = Before('playerBreakBlock');
export const BeforePlayerGameModeChange = Before('playerGameModeChange');
export const BeforePlayerInteractWithBlock = Before('playerInteractWithBlock');
export const BeforePlayerInteractWithEntity = Before(
	'playerInteractWithEntity',
);
export const BeforePlayerLeave = Before('playerLeave');
export const BeforeWeatherChange = Before('weatherChange');

export const SystemBeforeShutdown = SystemBefore('shutdown');
export const SystemBeforeStartup = SystemBefore('startup');
export const SystemAfterScriptEventReceive = SystemAfter('scriptEventReceive');

//#region Installer
const containers = {
	After: world.afterEvents,
	Before: world.beforeEvents,
	SystemBefore: system.beforeEvents,
	SystemAfter: system.afterEvents,
};

export function installDecoratedEventSubscribers() {
	let successCount = 0;
	let max = Object.keys(handlers).length;
	if (max === 0) {
		log.info('No decorated event handlers to load');
		return;
	}

	for (const key in handlers) {
		if (subs[key]) continue;
		const [containerName, eventKey] = key.split('.') as [
			keyof typeof containers,
			string,
		];
		const signal: any = (containers[containerName] as any)?.[eventKey];
		if (!signal || typeof signal.subscribe !== 'function') {
			log.error(`${containerName}.${eventKey} is not available`);
			continue;
		}
		const list = handlers[key]!;
		const handle = signal.subscribe((ev: any) => {
			for (const h of list) {
				try {
					h(ev);
				} catch (e: any) {
					log.error(e?.stack ?? e);
				}
			}
		});
		subs[key] = handle;
		successCount++;
	}

	log.info(
		`Subscribed: ${successCount} event(s), failed: ${max - successCount}`,
	);
}
