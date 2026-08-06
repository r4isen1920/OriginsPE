import {
	EntityDamageCause,
	EntityHitEntityAfterEvent,
	EntityHurtAfterEvent,
	EntityHurtBeforeEvent,
	Player,
	PlayerLeaveAfterEvent,
	ProjectileHitEntityAfterEvent,
	system,
	TicksPerSecond,
	Vector3,
} from '@minecraft/server';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

import {
	AfterEntityHitEntity,
	AfterEntityHurt,
	AfterPlayerLeave,
	AfterProjectileHitEntity,
	BeforeEntityHurt,
} from '../core/platform/DecoratedEvents';
import { PlayerTick } from '../core/platform/Ticker';
import { Log } from '../utils/Log';



//#region TYPES

/** Why a player is currently not allowed to start an Origin/Class change. */
export type ChangeBlockReason = 'in_combat' | 'moving';

/** Cadence of the upkeep pass that refreshes invisibility and expires stale protection. */
const TICK_INTERVAL = 10;



//#region SERVICE

/**
 * This class shields players while they are picking or changing their Origin/Class.
 * 
 * A protected player takes no damage and is invisible; the lockout reported by
 * {@link ChangeProtectionService.blockReason} keeps the Orb/Paper unusable during and
 * shortly after combat so the shield cannot be used as a safe haven mid-fight.
 */
export default class ChangeProtectionService {
	private static readonly log = Log.get('ChangeProtectionService');

	/** How long after the last combat event the Orb/Paper stays locked. */
	private static readonly COMBAT_LOCKOUT_TICKS = 30 * TicksPerSecond;
	/** Absolute cap so a dismissed dialogue can never leave a player protected forever. */
	private static readonly MAX_PROTECTION_TICKS = 5 * 60 * TicksPerSecond;
	/** Horizontal speed (blocks/tick) above which a player counts as moving. */
	private static readonly MOVEMENT_EPSILON = 0.01;
	/** Walking this far from the anchor means the dialogue is gone, so protection is dropped. */
	private static readonly ANCHOR_ESCAPE_DISTANCE = 1.5;
	/** Re-applied every tick pass so the effect never lapses mid-flow. */
	private static readonly INVISIBILITY_REFRESH_TICKS = 60;

	/** playerId -> tick at which protection is force-expired. */
	private static readonly protectedUntil = new Map<string, number>();
	/** playerId -> location the player stood on when protection began. */
	private static readonly anchors = new Map<string, Vector3>();
	/** playerId -> tick of the last combat event involving that player. */
	private static readonly lastCombatTick = new Map<string, number>();


	//#region PROTECTION

	/** Starts (or extends) damage immunity and invisibility for `player`. */
	static protect(player: Player): void {
		const wasProtected = this.protectedUntil.has(player.id);
		this.protectedUntil.set(player.id, system.currentTick + this.MAX_PROTECTION_TICKS);
		this.anchors.set(player.id, player.location);
		this.refreshInvisibility(player);
		if (!wasProtected) this.log.info(`Protection started for player: ${player.name}`);
	}

	/** Ends damage immunity and invisibility for `player`. Safe to call when not protected. */
	static release(player: Player): void {
		if (!this.protectedUntil.delete(player.id)) return;
		this.anchors.delete(player.id);
		try { player.removeEffect(MinecraftEffectTypes.Invisibility); }
		catch (e: any) { this.log.error(`removeEffect invisibility, for: ${player.name}: `, e); }
		this.log.info(`Protection ended for player: ${player.name}`);
	}

	/** Whether `player` is currently shielded. Pure, so it is safe from before-event handlers. */
	static isProtected(player: Player): boolean {
		const until = this.protectedUntil.get(player.id);
		return until !== undefined && system.currentTick <= until;
	}

	/** Drops all cached state for the given player. Call on leave. */
	static forget(playerId: string): void {
		this.protectedUntil.delete(playerId);
		this.anchors.delete(playerId);
		this.lastCombatTick.delete(playerId);
	}


	//#region GATING

	/**
	 * Returns why `player` may not start an Origin/Class change right now,
	 * or `undefined` when the Orb/Paper is allowed.
	 */
	static blockReason(player: Player): ChangeBlockReason | undefined {
		if (this.combatTicksRemaining(player) > 0) return 'in_combat';
		if (this.isMoving(player)) return 'moving';
		return undefined;
	}

	/** Ticks left on the post-combat lockout, or 0 when the player is out of combat. */
	static combatTicksRemaining(player: Player): number {
		const last = this.lastCombatTick.get(player.id);
		if (last === undefined) return 0;
		return Math.max(0, last + this.COMBAT_LOCKOUT_TICKS - system.currentTick);
	}

	private static isMoving(player: Player): boolean {
		const velocity = player.getVelocity();
		return Math.hypot(velocity.x, velocity.z) > this.MOVEMENT_EPSILON;
	}

	/** Refreshes the combat lockout for `player`. Protected players are ignored. */
	private static markCombat(player: Player): void {
		if (this.isProtected(player)) return;
		const wasIdle = this.combatTicksRemaining(player) === 0;
		this.lastCombatTick.set(player.id, system.currentTick);
		if (wasIdle) this.log.debug(`Combat lockout started for player: ${player.name}`);
	}


	//#region HANDLERS

	@BeforeEntityHurt()
	static onHurtBefore(ev: EntityHurtBeforeEvent): void {
		const player = ev.hurtEntity;
		if (!(player instanceof Player)) return;
		// /kill must still work on a protected player.
		if (ev.damageSource.cause === EntityDamageCause.selfDestruct) return;
		if (!this.isProtected(player)) return;

		ev.cancel = true;
	}

	@AfterEntityHurt()
	static onHurt(ev: EntityHurtAfterEvent): void {
		if (ev.damageSource.cause === EntityDamageCause.selfDestruct) return;

		const victim = ev.hurtEntity;
		if (victim instanceof Player) this.markCombat(victim);

		const attacker = ev.damageSource.damagingEntity;
		if (attacker instanceof Player) this.markCombat(attacker);
	}

	@AfterEntityHitEntity()
	static onHitEntity(ev: EntityHitEntityAfterEvent): void {
		const attacker = ev.damagingEntity;
		if (attacker instanceof Player) this.markCombat(attacker);
	}

	@AfterProjectileHitEntity()
	static onProjectileHit(ev: ProjectileHitEntityAfterEvent): void {
		const shooter = ev.source;
		if (shooter instanceof Player) this.markCombat(shooter);
	}

	@AfterPlayerLeave()
	static onLeave(ev: PlayerLeaveAfterEvent): void {
		this.forget(ev.playerId);
	}


	//#region TICK

	@PlayerTick(TICK_INTERVAL)
	static onPlayerTick(player: Player): void {
		const until = this.protectedUntil.get(player.id);
		if (until === undefined) return;

		if (system.currentTick > until) {
			this.log.warn(`Protection timed out for player: ${player.name}`);
			this.release(player);
			return;
		}
		if (this.hasEscapedAnchor(player)) {
			this.release(player);
			return;
		}
		this.refreshInvisibility(player);
	}

	/**
	 * A player cannot walk while an NPC dialogue is open, so drifting away from the
	 * anchor means the screen was dismissed and protection should stop.
	 * The anchor follows the player while airborne so a join-time fall is not counted.
	 */
	private static hasEscapedAnchor(player: Player): boolean {
		const anchor = this.anchors.get(player.id);
		if (!anchor || !player.isOnGround) {
			this.anchors.set(player.id, player.location);
			return false;
		}
		const { x, y, z } = player.location;
		const distance = Math.hypot(x - anchor.x, y - anchor.y, z - anchor.z);
		return distance > this.ANCHOR_ESCAPE_DISTANCE;
	}

	private static refreshInvisibility(player: Player): void {
		try {
			player.addEffect(MinecraftEffectTypes.Invisibility, this.INVISIBILITY_REFRESH_TICKS, {
				amplifier: 0,
				showParticles: false,
			});
		} catch (e: any) {
			this.log.error(`addEffect invisibility, for: ${player.name}: `, e);
		}
	}
}
