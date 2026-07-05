import {
	world,
	system,
	PlayerPlaceBlockAfterEvent,
	PlayerBreakBlockAfterEvent,
	PlayerInteractWithBlockBeforeEvent,
	PlayerInteractWithBlockAfterEvent,
	ItemUseBeforeEvent,
	ItemUseAfterEvent,
	PlayerInteractWithEntityBeforeEvent,
	PlayerInteractWithEntityAfterEvent,
	PlayerInventoryItemChangeAfterEvent,
	PlayerLeaveAfterEvent,
	PlayerLeaveBeforeEvent,
	PlayerJoinAfterEvent,
	PlayerSpawnAfterEvent,
	EntityDieAfterEvent,
	EntityHurtAfterEvent,
	EntityHurtBeforeEvent,
	EntityHitEntityAfterEvent,
	EntityHitBlockAfterEvent,
	EntityLoadAfterEvent,
	EntityRemoveAfterEvent,
	EntityRemoveBeforeEvent,
	EntitySpawnAfterEvent,
	ExplosionAfterEvent,
	ExplosionBeforeEvent,
	ItemStartUseAfterEvent,
	ItemStopUseAfterEvent,
	ItemCompleteUseAfterEvent,
	ItemReleaseUseAfterEvent,
	ItemStartUseOnAfterEvent,
	ItemStopUseOnAfterEvent,
	BlockExplodeAfterEvent,
	ButtonPushAfterEvent,
	LeverActionAfterEvent,
	PistonActivateAfterEvent,
	PressurePlatePopAfterEvent,
	PressurePlatePushAfterEvent,
	ProjectileHitBlockAfterEvent,
	ProjectileHitEntityAfterEvent,
	TargetBlockHitAfterEvent,
	TripWireTripAfterEvent,
	WeatherChangeAfterEvent,
	WeatherChangeBeforeEvent,
	EffectAddAfterEvent,
	EffectAddBeforeEvent,
	PlayerBreakBlockBeforeEvent,
	PlayerGameModeChangeAfterEvent,
	PlayerGameModeChangeBeforeEvent,
	PlayerButtonInputAfterEvent,
	PlayerHotbarSelectedSlotChangeAfterEvent,
	DataDrivenEntityTriggerAfterEvent,
	ScriptEventCommandMessageAfterEvent,
	EntityItemPickupAfterEvent,
	PlayerDimensionChangeAfterEvent,
	BlockContainerClosedAfterEvent,
	BlockContainerOpenedAfterEvent,
	EntityContainerClosedAfterEvent,
	EntityContainerOpenedAfterEvent,
	EntityHealAfterEvent,
	EntityHealBeforeEvent,
	EntityHealthChangedAfterEvent,
	EntityItemDropAfterEvent,
	EntityItemPickupBeforeEvent,
	EntityUpgradeAfterEvent,
	GameRuleChangeAfterEvent,
	PlayerEmoteAfterEvent,
	PlayerInputModeChangeAfterEvent,
	PlayerInputPermissionCategoryChangeAfterEvent,
	PlayerSwingStartAfterEvent,
	ShutdownEvent,
	StartupEvent,
	WorldLoadAfterEvent,
} from '@minecraft/server';
import { Log } from '../../utils';

const log = Log.get('DecoratedEvents');

type EventHandler<T> = (event: T) => void;

interface EventRegistry {
	afterEvents: {
		playerPlaceBlock: EventHandler<PlayerPlaceBlockAfterEvent>[];
		playerBreakBlock: EventHandler<PlayerBreakBlockAfterEvent>[];
		playerInteractWithBlock: EventHandler<PlayerInteractWithBlockAfterEvent>[];
		playerInteractWithEntity: EventHandler<PlayerInteractWithEntityAfterEvent>[];
		playerInventoryItemChange: EventHandler<PlayerInventoryItemChangeAfterEvent>[]
		playerLeave: EventHandler<PlayerLeaveAfterEvent>[];
		playerJoin: EventHandler<PlayerJoinAfterEvent>[];
		playerSpawn: EventHandler<PlayerSpawnAfterEvent>[];
		entityDie: EventHandler<EntityDieAfterEvent>[];
		entityHurt: EventHandler<EntityHurtAfterEvent>[];
		entityHitEntity: EventHandler<EntityHitEntityAfterEvent>[];
		entityHitBlock: EventHandler<EntityHitBlockAfterEvent>[];
		entityLoad: EventHandler<EntityLoadAfterEvent>[];
		entityRemove: EventHandler<EntityRemoveAfterEvent>[];
		entitySpawn: EventHandler<EntitySpawnAfterEvent>[];
		explosion: EventHandler<ExplosionAfterEvent>[];
		itemUse: EventHandler<ItemUseAfterEvent>[];
		itemStartUse: EventHandler<ItemStartUseAfterEvent>[];
		itemStopUse: EventHandler<ItemStopUseAfterEvent>[];
		itemCompleteUse: EventHandler<ItemCompleteUseAfterEvent>[];
		itemReleaseUse: EventHandler<ItemReleaseUseAfterEvent>[];
		itemStartUseOn: EventHandler<ItemStartUseOnAfterEvent>[];
		itemStopUseOn: EventHandler<ItemStopUseOnAfterEvent>[];
		blockExplode: EventHandler<BlockExplodeAfterEvent>[];
		buttonPush: EventHandler<ButtonPushAfterEvent>[];
		leverAction: EventHandler<LeverActionAfterEvent>[];
		pistonActivate: EventHandler<PistonActivateAfterEvent>[];
		pressurePlatePop: EventHandler<PressurePlatePopAfterEvent>[];
		pressurePlatePush: EventHandler<PressurePlatePushAfterEvent>[];
		projectileHitBlock: EventHandler<ProjectileHitBlockAfterEvent>[];
		projectileHitEntity: EventHandler<ProjectileHitEntityAfterEvent>[];
		targetBlockHit: EventHandler<TargetBlockHitAfterEvent>[];
		tripWireTrip: EventHandler<TripWireTripAfterEvent>[];
		weatherChange: EventHandler<WeatherChangeAfterEvent>[];
		effectAdd: EventHandler<EffectAddAfterEvent>[];
		playerGameModeChange: EventHandler<PlayerGameModeChangeAfterEvent>[];
		playerButtonInput: EventHandler<PlayerButtonInputAfterEvent>[];
		playerHotbarSelectedSlotChange: EventHandler<PlayerHotbarSelectedSlotChangeAfterEvent>[];
		dataDrivenEntityTrigger: EventHandler<DataDrivenEntityTriggerAfterEvent>[];
		entityItemPickup: EventHandler<EntityItemPickupAfterEvent>[];
		playerDimensionChange: EventHandler<PlayerDimensionChangeAfterEvent>[];
		blockContainerClosed: EventHandler<BlockContainerClosedAfterEvent>[];
		blockContainerOpened: EventHandler<BlockContainerOpenedAfterEvent>[];
		entityContainerClosed: EventHandler<EntityContainerClosedAfterEvent>[];
		entityContainerOpened: EventHandler<EntityContainerOpenedAfterEvent>[];
		entityHeal: EventHandler<EntityHealAfterEvent>[];
		entityHealthChanged: EventHandler<EntityHealthChangedAfterEvent>[];
		entityItemDrop: EventHandler<EntityItemDropAfterEvent>[];
		entityUpgrade: EventHandler<EntityUpgradeAfterEvent>[];
		gameRuleChange: EventHandler<GameRuleChangeAfterEvent>[];
		playerEmote: EventHandler<PlayerEmoteAfterEvent>[];
		playerInputModeChange: EventHandler<PlayerInputModeChangeAfterEvent>[];
		playerInputPermissionCategoryChange: EventHandler<PlayerInputPermissionCategoryChangeAfterEvent>[];
		playerSwingStart: EventHandler<PlayerSwingStartAfterEvent>[];
		worldLoad: EventHandler<WorldLoadAfterEvent>[];
	};
	systemAfterEvents: {
		scriptEventReceive: EventHandler<ScriptEventCommandMessageAfterEvent>[];
	};
	systemBeforeEvents: {
		shutdown: EventHandler<ShutdownEvent>[];
		startup: EventHandler<StartupEvent>[];
	};
	beforeEvents: {
		playerInteractWithBlock: EventHandler<PlayerInteractWithBlockBeforeEvent>[];
		playerInteractWithEntity: EventHandler<PlayerInteractWithEntityBeforeEvent>[];
		playerLeave: EventHandler<PlayerLeaveBeforeEvent>[];
		itemUse: EventHandler<ItemUseBeforeEvent>[];
		entityHurt: EventHandler<EntityHurtBeforeEvent>[];
		entityRemove: EventHandler<EntityRemoveBeforeEvent>[];
		explosion: EventHandler<ExplosionBeforeEvent>[];
		weatherChange: EventHandler<WeatherChangeBeforeEvent>[];
		effectAdd: EventHandler<EffectAddBeforeEvent>[];
		playerBreakBlock: EventHandler<PlayerBreakBlockBeforeEvent>[];
		playerGameModeChange: EventHandler<PlayerGameModeChangeBeforeEvent>[];
		entityHeal: EventHandler<EntityHealBeforeEvent>[];
		entityItemPickup: EventHandler<EntityItemPickupBeforeEvent>[];
	};
}

const eventRegistry: EventRegistry = {
	afterEvents: {
		playerPlaceBlock: [],
		playerBreakBlock: [],
		playerInteractWithBlock: [],
		playerInteractWithEntity: [],
		playerInventoryItemChange: [],
		playerLeave: [],
		playerJoin: [],
		playerSpawn: [],
		entityDie: [],
		entityHurt: [],
		entityHitEntity: [],
		entityHitBlock: [],
		entityLoad: [],
		entityRemove: [],
		entitySpawn: [],
		explosion: [],
		itemUse: [],
		itemStartUse: [],
		itemStopUse: [],
		itemCompleteUse: [],
		itemReleaseUse: [],
		itemStartUseOn: [],
		itemStopUseOn: [],
		blockExplode: [],
		buttonPush: [],
		leverAction: [],
		pistonActivate: [],
		pressurePlatePop: [],
		pressurePlatePush: [],
		projectileHitBlock: [],
		projectileHitEntity: [],
		targetBlockHit: [],
		tripWireTrip: [],
		weatherChange: [],
		effectAdd: [],
		playerGameModeChange: [],
		playerButtonInput: [],
		playerHotbarSelectedSlotChange: [],
		dataDrivenEntityTrigger: [],
		entityItemPickup: [],
		playerDimensionChange: [],
		blockContainerClosed: [],
		blockContainerOpened: [],
		entityContainerClosed: [],
		entityContainerOpened: [],
		entityHeal: [],
		entityHealthChanged: [],
		entityItemDrop: [],
		entityUpgrade: [],
		gameRuleChange: [],
		playerEmote: [],
		playerInputModeChange: [],
		playerInputPermissionCategoryChange: [],
		playerSwingStart: [],
		worldLoad: [],
	},
	systemAfterEvents: {
		scriptEventReceive: [],
	},
	systemBeforeEvents: {
		shutdown: [],
		startup: [],
	},
	beforeEvents: {
		playerInteractWithBlock: [],
		playerInteractWithEntity: [],
		playerLeave: [],
		itemUse: [],
		entityHurt: [],
		entityRemove: [],
		explosion: [],
		weatherChange: [],
		effectAdd: [],
		playerBreakBlock: [],
		playerGameModeChange: [],
		entityHeal: [],
		entityItemPickup: [],
	},
};

type EventType = 'afterEvents' | 'beforeEvents' | 'systemAfterEvents' | 'systemBeforeEvents';
type EventName = keyof EventRegistry['afterEvents'] | keyof EventRegistry['beforeEvents'] | keyof EventRegistry['systemAfterEvents'] | keyof EventRegistry['systemBeforeEvents'];

/** Stores the subscribe options for a registered handler, keyed by its bound function. */
const handlerOptions = new WeakMap<EventHandler<any>, unknown>();

/**
 * Dual-mode event decorator: usable directly as `@Decorator` or as a factory
 * `@Decorator(options)` to forward subscribe options to the underlying event.
 */
type EventDecorator = {
	(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
	(options?: any): (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => void;
};

/**
 * Creates a decorator for registering event handlers, optionally forwarding
 * subscribe options to the underlying event when used as a factory.
 */
function createEventDecorator<T>(
	eventType: EventType,
	eventName: EventName,
	options?: unknown
) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor
	) {
		const handler = descriptor.value as EventHandler<T>;
		const boundHandler = handler.bind(target);
		(eventRegistry[eventType] as any)[eventName].push(boundHandler);
		if (options !== undefined) handlerOptions.set(boundHandler, options);
		log.debug(
			`Registered ${eventType}.${eventName} handler: ${target.name}.${propertyKey}`
		);
	};
}

/**
 * Builds a dual-mode decorator for the given event, supporting both
 * `@Decorator` and `@Decorator(options)` usage.
 */
function eventDecorator<T>(eventType: EventType, eventName: EventName): EventDecorator {
	function decorator(targetOrOptions?: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): any {
		if (typeof propertyKey === 'string' || typeof propertyKey === 'symbol') {
			return createEventDecorator<T>(eventType, eventName)(targetOrOptions, propertyKey as string, descriptor!);
		}
		const options = targetOrOptions;
		return (target: any, key: string, desc: PropertyDescriptor) =>
			createEventDecorator<T>(eventType, eventName, options)(target, key, desc);
	}
	return decorator as EventDecorator;
}




//#region AfterEvents

export const AfterPlayerPlaceBlock = eventDecorator<PlayerPlaceBlockAfterEvent>('afterEvents', 'playerPlaceBlock');
export const AfterPlayerBreakBlock = eventDecorator<PlayerBreakBlockAfterEvent>('afterEvents', 'playerBreakBlock');
export const AfterPlayerInteractWithBlock = eventDecorator<PlayerInteractWithBlockAfterEvent>('afterEvents', 'playerInteractWithBlock');
export const AfterPlayerInteractWithEntity = eventDecorator<PlayerInteractWithEntityAfterEvent>('afterEvents', 'playerInteractWithEntity');
export const AfterPlayerInventoryItemChange = eventDecorator<PlayerInventoryItemChangeAfterEvent>('afterEvents', 'playerInventoryItemChange');
export const AfterPlayerLeave = eventDecorator<PlayerLeaveAfterEvent>('afterEvents', 'playerLeave');
export const AfterPlayerJoin = eventDecorator<PlayerJoinAfterEvent>('afterEvents', 'playerJoin');
export const AfterPlayerSpawn = eventDecorator<PlayerSpawnAfterEvent>('afterEvents', 'playerSpawn');
export const AfterEntityDie = eventDecorator<EntityDieAfterEvent>('afterEvents', 'entityDie');
export const AfterEntityHurt = eventDecorator<EntityHurtAfterEvent>('afterEvents', 'entityHurt');
export const AfterEntityHitEntity = eventDecorator<EntityHitEntityAfterEvent>('afterEvents', 'entityHitEntity');
export const AfterEntityHitBlock = eventDecorator<EntityHitBlockAfterEvent>('afterEvents', 'entityHitBlock');
export const AfterEntityLoad = eventDecorator<EntityLoadAfterEvent>('afterEvents', 'entityLoad');
export const AfterEntityRemove = eventDecorator<EntityRemoveAfterEvent>('afterEvents', 'entityRemove');
export const AfterEntitySpawn = eventDecorator<EntitySpawnAfterEvent>('afterEvents', 'entitySpawn');
export const AfterExplosion = eventDecorator<ExplosionAfterEvent>('afterEvents', 'explosion');
export const AfterItemUse = eventDecorator<ItemUseAfterEvent>('afterEvents', 'itemUse');
export const AfterItemStartUse = eventDecorator<ItemStartUseAfterEvent>('afterEvents', 'itemStartUse');
export const AfterItemStopUse = eventDecorator<ItemStopUseAfterEvent>('afterEvents', 'itemStopUse');
export const AfterItemCompleteUse = eventDecorator<ItemCompleteUseAfterEvent>('afterEvents', 'itemCompleteUse');
export const AfterItemReleaseUse = eventDecorator<ItemReleaseUseAfterEvent>('afterEvents', 'itemReleaseUse');
export const AfterItemStartUseOn = eventDecorator<ItemStartUseOnAfterEvent>('afterEvents', 'itemStartUseOn');
export const AfterItemStopUseOn = eventDecorator<ItemStopUseOnAfterEvent>('afterEvents', 'itemStopUseOn');
export const AfterBlockExplode = eventDecorator<BlockExplodeAfterEvent>('afterEvents', 'blockExplode');
export const AfterButtonPush = eventDecorator<ButtonPushAfterEvent>('afterEvents', 'buttonPush');
export const AfterLeverAction = eventDecorator<LeverActionAfterEvent>('afterEvents', 'leverAction');
export const AfterPistonActivate = eventDecorator<PistonActivateAfterEvent>('afterEvents', 'pistonActivate');
export const AfterPressurePlatePop = eventDecorator<PressurePlatePopAfterEvent>('afterEvents', 'pressurePlatePop');
export const AfterPressurePlatePush = eventDecorator<PressurePlatePushAfterEvent>('afterEvents', 'pressurePlatePush');
export const AfterProjectileHitBlock = eventDecorator<ProjectileHitBlockAfterEvent>('afterEvents', 'projectileHitBlock');
export const AfterProjectileHitEntity = eventDecorator<ProjectileHitEntityAfterEvent>('afterEvents', 'projectileHitEntity');
export const AfterTargetBlockHit = eventDecorator<TargetBlockHitAfterEvent>('afterEvents', 'targetBlockHit');
export const AfterTripWireTrip = eventDecorator<TripWireTripAfterEvent>('afterEvents', 'tripWireTrip');
export const AfterWeatherChange = eventDecorator<WeatherChangeAfterEvent>('afterEvents', 'weatherChange');
export const AfterEffectAdd = eventDecorator<EffectAddAfterEvent>('afterEvents', 'effectAdd');
export const AfterPlayerGameModeChange = eventDecorator<PlayerGameModeChangeAfterEvent>('afterEvents', 'playerGameModeChange');
export const AfterPlayerButtonInput = eventDecorator<PlayerButtonInputAfterEvent>('afterEvents', 'playerButtonInput');
export const AfterPlayerHotbarSelectedSlotChange = eventDecorator<PlayerHotbarSelectedSlotChangeAfterEvent>('afterEvents', 'playerHotbarSelectedSlotChange');
export const AfterDataDrivenEntityTrigger = eventDecorator<DataDrivenEntityTriggerAfterEvent>('afterEvents', 'dataDrivenEntityTrigger');
export const AfterEntityItemPickup = eventDecorator<EntityItemPickupAfterEvent>('afterEvents', 'entityItemPickup');
export const AfterPlayerDimensionChange = eventDecorator<PlayerDimensionChangeAfterEvent>('afterEvents', 'playerDimensionChange');
export const AfterBlockContainerClosed = eventDecorator<BlockContainerClosedAfterEvent>('afterEvents', 'blockContainerClosed');
export const AfterBlockContainerOpened = eventDecorator<BlockContainerOpenedAfterEvent>('afterEvents', 'blockContainerOpened');
export const AfterEntityContainerClosed = eventDecorator<EntityContainerClosedAfterEvent>('afterEvents', 'entityContainerClosed');
export const AfterEntityContainerOpened = eventDecorator<EntityContainerOpenedAfterEvent>('afterEvents', 'entityContainerOpened');
export const AfterEntityHeal = eventDecorator<EntityHealAfterEvent>('afterEvents', 'entityHeal');
export const AfterEntityHealthChanged = eventDecorator<EntityHealthChangedAfterEvent>('afterEvents', 'entityHealthChanged');
export const AfterEntityItemDrop = eventDecorator<EntityItemDropAfterEvent>('afterEvents', 'entityItemDrop');
export const AfterEntityUpgrade = eventDecorator<EntityUpgradeAfterEvent>('afterEvents', 'entityUpgrade');
export const AfterGameRuleChange = eventDecorator<GameRuleChangeAfterEvent>('afterEvents', 'gameRuleChange');
export const AfterPlayerEmote = eventDecorator<PlayerEmoteAfterEvent>('afterEvents', 'playerEmote');
export const AfterPlayerInputModeChange = eventDecorator<PlayerInputModeChangeAfterEvent>('afterEvents', 'playerInputModeChange');
export const AfterPlayerInputPermissionCategoryChange = eventDecorator<PlayerInputPermissionCategoryChangeAfterEvent>('afterEvents', 'playerInputPermissionCategoryChange');
export const AfterPlayerSwingStart = eventDecorator<PlayerSwingStartAfterEvent>('afterEvents', 'playerSwingStart');
export const AfterWorldLoad = eventDecorator<WorldLoadAfterEvent>('afterEvents', 'worldLoad');





//#region SystemAfterEvents

export const SystemScriptEventReceive = eventDecorator<ScriptEventCommandMessageAfterEvent>('systemAfterEvents', 'scriptEventReceive');


//#region SystemBeforeEvents

export const SystemShutdown = eventDecorator<ShutdownEvent>('systemBeforeEvents', 'shutdown');
export const SystemStartup = eventDecorator<StartupEvent>('systemBeforeEvents', 'startup');




//#region BeforeEvents

export const BeforePlayerInteractWithBlock = eventDecorator<PlayerInteractWithBlockBeforeEvent>('beforeEvents', 'playerInteractWithBlock');
export const BeforePlayerInteractWithEntity = eventDecorator<PlayerInteractWithEntityBeforeEvent>('beforeEvents', 'playerInteractWithEntity');
export const BeforePlayerLeave = eventDecorator<PlayerLeaveBeforeEvent>('beforeEvents', 'playerLeave');
export const BeforeItemUse = eventDecorator<ItemUseBeforeEvent>('beforeEvents', 'itemUse');
export const BeforeEntityHurt = eventDecorator<EntityHurtBeforeEvent>('beforeEvents', 'entityHurt');
export const BeforeEntityRemove = eventDecorator<EntityRemoveBeforeEvent>('beforeEvents', 'entityRemove');
export const BeforeExplosion = eventDecorator<ExplosionBeforeEvent>('beforeEvents', 'explosion');
export const BeforeWeatherChange = eventDecorator<WeatherChangeBeforeEvent>('beforeEvents', 'weatherChange');
export const BeforeEffectAdd = eventDecorator<EffectAddBeforeEvent>('beforeEvents', 'effectAdd');
export const BeforePlayerBreakBlock = eventDecorator<PlayerBreakBlockBeforeEvent>('beforeEvents', 'playerBreakBlock');
export const BeforePlayerGameModeChange = eventDecorator<PlayerGameModeChangeBeforeEvent>('beforeEvents', 'playerGameModeChange');
export const BeforeEntityHeal = eventDecorator<EntityHealBeforeEvent>('beforeEvents', 'entityHeal');
export const BeforeEntityItemPickup = eventDecorator<EntityItemPickupBeforeEvent>('beforeEvents', 'entityItemPickup');




//#region Init

/**
 * Initializes all event subscriptions based on registered decorators.
 * This should be called once during startup.
 */
export function installDecoratedEventSubscribers () {
	// Subscribe to all after events
	for (const [eventName, handlers] of Object.entries(
		eventRegistry.afterEvents
	)) {
		for (const handler of handlers) {
			const options = handlerOptions.get(handler);
			const wrapped = (event: any) => {
				try {
					handler(event);
				} catch (error) {
					log.error(
						`Error in afterEvents.${eventName} handler: ${error}`
					);
				}
			};
			if (options !== undefined) {
				(world.afterEvents as any)[eventName].subscribe(wrapped, options);
			} else {
				(world.afterEvents as any)[eventName].subscribe(wrapped);
			}
		}
		if (handlers.length > 0) {
			log.info(
				`Subscribed ${handlers.length} handler(s) to afterEvents.${eventName}`
			);
		}
	}

	// Subscribe to all system after events
	for (const [eventName, handlers] of Object.entries(
		eventRegistry.systemAfterEvents
	)) {
		for (const handler of handlers) {
			const options = handlerOptions.get(handler);
			const wrapped = (event: any) => {
				try {
					handler(event);
				} catch (error) {
					log.error(
						`Error in system.afterEvents.${eventName} handler: ${error}`
					);
				}
			};
			if (options !== undefined) {
				(system.afterEvents as any)[eventName].subscribe(wrapped, options);
			} else {
				(system.afterEvents as any)[eventName].subscribe(wrapped);
			}
		}
		if (handlers.length > 0) {
			log.info(
				`Subscribed ${handlers.length} handler(s) to system.afterEvents.${eventName}`
			);
		}
	}

	// Subscribe to all before events
	for (const [eventName, handlers] of Object.entries(
		eventRegistry.beforeEvents
	)) {
		for (const handler of handlers) {
			const options = handlerOptions.get(handler);
			const wrapped = (event: any) => {
				try {
					handler(event);
				} catch (error) {
					log.error(
						`Error in beforeEvents.${eventName} handler: ${error}`
					);
				}
			};
			if (options !== undefined) {
				(world.beforeEvents as any)[eventName].subscribe(wrapped, options);
			} else {
				(world.beforeEvents as any)[eventName].subscribe(wrapped);
			}
		}
		if (handlers.length > 0) {
			log.info(
				`Subscribed ${handlers.length} handler(s) to beforeEvents.${eventName}`
			);
		}
	}

	// Subscribe to all system before events
	for (const [eventName, handlers] of Object.entries(
		eventRegistry.systemBeforeEvents
	)) {
		for (const handler of handlers) {
			const options = handlerOptions.get(handler);
			const wrapped = (event: any) => {
				try {
					handler(event);
				} catch (error) {
					log.error(
						`Error in system.beforeEvents.${eventName} handler: ${error}`
					);
				}
			};
			if (options !== undefined) {
				(system.beforeEvents as any)[eventName].subscribe(wrapped, options);
			} else {
				(system.beforeEvents as any)[eventName].subscribe(wrapped);
			}
		}
		if (handlers.length > 0) {
			log.info(
				`Subscribed ${handlers.length} handler(s) to system.beforeEvents.${eventName}`
			);
		}
	}

	log.info('All event subscriptions initialized.');
}
