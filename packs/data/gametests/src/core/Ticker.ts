import { Player, PlayerJoinAfterEvent, PlayerLeaveAfterEvent, PlayerSpawnAfterEvent, system, world } from '@minecraft/server';

import { Log } from '../utils/Log';
import { AfterPlayerJoin, AfterPlayerLeave, AfterPlayerSpawn } from './DecoratedEvents';
import { OnWorldLoad } from '@bedrock-oss/stylish';


//#region TYPES

/** Function invoked once per scheduled tick. */
export type GlobalTickFn = () => void;
/** Function invoked once per cached player per scheduled tick. */
export type PlayerTickFn = (player: Player) => void;

interface BaseTask {
	id: string;
	intervalTicks: number;
	priority: number;
	nextTick: number;
}
interface GlobalTask extends BaseTask { kind: 'global'; fn: GlobalTickFn; }
interface PlayerTask extends BaseTask { kind: 'player'; fn: PlayerTickFn; }
type Task = GlobalTask | PlayerTask;


//#region TICKER

/**
 * Single consolidated scheduler driving all repeating work in the pack.
 *
 * - One `system.runInterval(..., 1)` is registered for the entire add-on.
 * - Tasks are scheduled by interval (in ticks) and priority (higher first).
 * - Per-player tasks iterate a cached player list invalidated on join/leave.
 * - Handler errors are logged and never break sibling tasks.
 *
 * Use {@link Tick} / {@link PlayerTick} decorators on static methods to
 * register at module-evaluation time, or call {@link Ticker.every} /
 * {@link Ticker.everyPlayer} explicitly.
 */
export class Ticker {
	private static readonly log = Log.get('Ticker');
	private static readonly tasks: Task[] = [];
	private static cachedPlayers: Player[] = [];
	private static playersDirty = true;
	private static started = false;

	/** Registers a global recurring task. */
	static every(intervalTicks: number, fn: GlobalTickFn, opts?: { id?: string; priority?: number }): void {
		this.tasks.push({
			kind: 'global',
			id: opts?.id ?? `global#${this.tasks.length}`,
			intervalTicks: Math.max(1, intervalTicks | 0),
			priority: opts?.priority ?? 0,
			nextTick: 0,
			fn,
		});
		this.tasks.sort((a, b) => b.priority - a.priority);
	}

	/** Registers a per-player recurring task. */
	static everyPlayer(intervalTicks: number, fn: PlayerTickFn, opts?: { id?: string; priority?: number }): void {
		this.tasks.push({
			kind: 'player',
			id: opts?.id ?? `player#${this.tasks.length}`,
			intervalTicks: Math.max(1, intervalTicks | 0),
			priority: opts?.priority ?? 0,
			nextTick: 0,
			fn,
		});
		this.tasks.sort((a, b) => b.priority - a.priority);
	}

	/** Force the cached player list to refresh next tick. */
	@AfterPlayerSpawn
	@AfterPlayerJoin
	@AfterPlayerLeave
	static invalidatePlayers(_: PlayerJoinAfterEvent | PlayerLeaveAfterEvent | PlayerSpawnAfterEvent): void {
		this.playersDirty = true;
	}

	@OnWorldLoad
	static start(): void {
		if (this.started) return;
		this.started = true;

		system.runInterval(() => this.pump(), 1);
		this.log.info('Ticker started');
	}

	private static pump(): void {
		const now = system.currentTick;
		if (this.playersDirty) {
			this.cachedPlayers = world.getAllPlayers().filter((p) => p.isValid);
			this.playersDirty = false;
		}
		for (const task of this.tasks) {
			if (now < task.nextTick) continue;
			task.nextTick = now + task.intervalTicks;
			if (task.kind === 'global') {
				try { task.fn(); } catch (e: any) { this.log.error(`[${task.id}] ${e?.stack ?? e}`); }
			} else {
				for (const player of this.cachedPlayers) {
					if (!player.isValid) continue;
					try { task.fn(player); } catch (e: any) { this.log.error(`[${task.id}] ${e?.stack ?? e}`); }
				}
			}
		}
	}
}


//#region DECORATORS

/**
 * Decorator: register a static method as a global tick task.
 *
 * Usage:
 * ```ts
 * class Foo {
 *   @Tick(20)
 *   static onTick() { ... }
 * }
 * ```
 */
export function Tick(intervalTicks: number, priority = 0): MethodDecorator {
	return (target, propertyKey, _descriptor) => {
		const fn = (target as any)[propertyKey] as GlobalTickFn | undefined;
		if (typeof fn !== 'function') return;
		Ticker.every(intervalTicks, fn.bind(target), {
			id: `${(target as any).name ?? 'anon'}.${String(propertyKey)}`,
			priority,
		});
	};
}

/**
 * Decorator: register a static method as a per-player tick task.
 *
 * Usage:
 * ```ts
 * class Foo {
 *   @PlayerTick(2)
 *   static onPlayerTick(player: Player) { ... }
 * }
 * ```
 */
export function PlayerTick(intervalTicks: number, priority = 0): MethodDecorator {
	return (target, propertyKey, _descriptor) => {
		const fn = (target as any)[propertyKey] as PlayerTickFn | undefined;
		if (typeof fn !== 'function') return;
		Ticker.everyPlayer(intervalTicks, fn.bind(target), {
			id: `${(target as any).name ?? 'anon'}.${String(propertyKey)}`,
			priority,
		});
	};
}
