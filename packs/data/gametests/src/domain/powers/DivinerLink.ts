import {
	EntityComponentTypes,
	EntityDamageCause,
	EntityHealthChangedAfterEvent,
	EntityHealthComponent,
	EntityHurtBeforeEvent,
	Player,
	PlayerLeaveAfterEvent,
	PlayerSpawnAfterEvent,
	system,
	TicksPerSecond,
} from '@minecraft/server';
import {
	CustomForm,
	DataDrivenScreenClosedReason,
	DropdownItemData,
	ObservableNumber,
	UIRawMessage,
} from '@minecraft/server-ui';

import {
	AfterEntityHealthChanged,
	AfterPlayerLeave,
	AfterPlayerSpawn,
	BeforeEntityHurt,
} from '../../core/platform/DecoratedEvents';
import { PlayerState } from '../../core/platform/PlayerState';
import { Ticker } from '../../core/platform/Ticker';
import { AttributeService } from '../../services/AttributeService';
import { ResourceBarService } from '../../services/ResourceBarService';
import { EntityUtils } from '../../utils/EntityUtils';
import { Log } from '../../utils/Log';
import OverheadText from '../../ui/OverheadText';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';

const BAR_FULL = 100;
const BAR_TWO_THIRDS = 71;
const BAR_ONE_THIRD = 29;


//#region CONSTANTS

/** A linked participant reference. Stored so offline members remain listed. */
export interface LinkMember {
	id: string;
	name: string;
}

/** Persistent flag keys backing the link group state. */
enum LinkFlag {
	/** Owner-side roster of members: JSON `LinkMember[]`. */
	Group = 'dv_group',
	/** Member-side owner reference: JSON `LinkMember`. */
	Owner = 'dv_owner',
	/** Member-side captured base max health at link time. */
	Base = 'dv_base',
	/** Last member count reflected on the persistent link bar. */
	BarLevel = 'dv_bar',
}

/** Cooldown key shared by the whole group when Aegis triggers. */
const AEGIS_KEY = 'aegis';
/** Intervention swap cooldown key. */
const INTERVENTION_KEY = 'intervention';

const MAX_MEMBERS = 3;
const LINK_RANGE = 8;
const AEGIS_COOLDOWN_TICKS = 120 * TicksPerSecond;
const INTERVENTION_COOLDOWN_TICKS = 120 * TicksPerSecond;
const LINK_BAR_ID = 26;
const AEGIS_BAR_ID = 33;
const INTERVENTION_BAR_ID = 32;
const AEGIS_BUFF_DURATION = 200;
const BASE_MAX_HEALTH = 20;
const MIN_BASE_HEALTH = 1;
const MAX_POOL_HEALTH = 150;
const FORM_RETRY_TICKS = 10;
const FORM_MAX_RETRIES = 8;

/** Effects excluded when counting Instability effects (the buffs Aegis applies). */
const INTERNAL_EFFECTS = new Set<string>([
	MinecraftEffectTypes.Absorption,
	MinecraftEffectTypes.FireResistance,
	MinecraftEffectTypes.Regeneration,
]);


//#region SERVICE

/**
 * Central "bespoke" interaction system for the Diviner origin. Owns the persistent
 * link-group data model, the shared health pool, and the coordinated damage/heal
 * pipeline that lets Prescience, Oracle, Aegis, and Instability interact.
 */
export class DivinerLink {
	private static readonly log = Log.get('DivinerLink');
	/** Player ids whose health is being modified internally (reentrancy guard). */
	private static readonly guard = new Set<string>();


	//#region MODEL

	/** Returns the owner-side member roster for `owner`. */
	static readMembers(owner: Player): LinkMember[] {
		const raw = PlayerState.for(owner).getFlag<string>(LinkFlag.Group);
		if (!raw) return [];
		try {
			const arr = JSON.parse(raw);
			return Array.isArray(arr)
				? arr.filter((m): m is LinkMember => !!m && typeof m.id === 'string' && typeof m.name === 'string')
				: [];
		} catch {
			return [];
		}
	}

	private static writeMembers(owner: Player, members: readonly LinkMember[]): void {
		const state = PlayerState.for(owner);
		if (members.length === 0) {
			state.setFlag(LinkFlag.Group, undefined);
		} else {
			state.setFlag(LinkFlag.Group, JSON.stringify(members.slice(0, MAX_MEMBERS)));
		}
	}

	private static readOwnerRef(player: Player): LinkMember | undefined {
		const raw = PlayerState.for(player).getFlag<string>(LinkFlag.Owner);
		if (!raw) return undefined;
		try {
			const ref = JSON.parse(raw);
			return ref && typeof ref.id === 'string' ? ref : undefined;
		} catch {
			return undefined;
		}
	}

	private static resolveOnline(id: string): Player | undefined {
		return Ticker.getPlayers().find((p) => p.isValid && p.id === id);
	}

	private static healthOf(player: Player): EntityHealthComponent | undefined {
		return EntityUtils.getComponent(player, EntityComponentTypes.Health) as EntityHealthComponent | undefined;
	}

	/**
	 * Resolves the online participants of the group `player` belongs to, whether
	 * as owner or member. Returns undefined when the owner is offline or the
	 * membership is stale, so offline groups stay inactive.
	 */
	static participantsOf(player: Player): { owner: Player; participants: Player[] } | undefined {
		let owner: Player | undefined;
		let members: LinkMember[];

		const owned = this.readMembers(player);
		if (owned.length > 0) {
			owner = player;
			members = owned;
		} else {
			const ref = this.readOwnerRef(player);
			if (!ref) return undefined;
			owner = this.resolveOnline(ref.id);
			if (!owner) return undefined;
			members = this.readMembers(owner);
			if (!members.some((m) => m.id === player.id)) return undefined;
		}

		const participants: Player[] = [owner];
		for (const m of members) {
			const p = this.resolveOnline(m.id);
			if (p && p.id !== owner.id) participants.push(p);
		}
		return { owner, participants };
	}

	/**
	 * Resolves the participants Aegis should protect for `player`: their link group
	 * if any, otherwise the lone Diviner themselves so Aegis works without a link.
	 */
	private static resolveAegisGroup(player: Player): { owner: Player; participants: Player[] } | undefined {
		const resolved = this.participantsOf(player);
		if (resolved) return resolved;
		if (PlayerState.for(player).hasPower('aegis')) return { owner: player, participants: [player] };
		return undefined;
	}

	/** True if `target` is within link range of `owner` with a clear line of sight. */
	private static canBeLinked(owner: Player, target: Player): boolean {
		try {
			if (owner.dimension.id !== target.dimension.id) return false;

			const from = owner.getHeadLocation();
			const to = target.getHeadLocation();
			const dx = to.x - from.x;
			const dy = to.y - from.y;
			const dz = to.z - from.z;
			const dist = Math.hypot(dx, dy, dz);
			if (dist > LINK_RANGE) return false;
			if (dist < 0.001) return true;

			const hit = owner.dimension.getBlockFromRay(
				from,
				{ x: dx / dist, y: dy / dist, z: dz / dist },
				{ maxDistance: dist, includeLiquidBlocks: false, includePassableBlocks: false }
			);
			if (!hit) return true;

			const hx = hit.block.location.x + hit.faceLocation.x - from.x;
			const hy = hit.block.location.y + hit.faceLocation.y - from.y;
			const hz = hit.block.location.z + hit.faceLocation.z - from.z;
			return Math.hypot(hx, hy, hz) >= dist - 0.5;
		} catch {
			return false;
		}
	}


	//#region POOL

	/**
	 * Base max health used for pool math. For Instability holders this is the
	 * effect-reduced value so Prescience adjusts around Instability; otherwise the
	 * captured base at link time.
	 */
	static baseMaxFor(player: Player): number {
		const state = PlayerState.for(player);
		if (state.hasPower('instability')) {
			return Math.max(MIN_BASE_HEALTH, BASE_MAX_HEALTH - this.uniqueEffectCount(player));
		}
		return state.getFlag<number>(LinkFlag.Base) ?? BASE_MAX_HEALTH;
	}

	/** Number of unique status effects excluding effects the Diviner powers apply. */
	static uniqueEffectCount(player: Player): number {
		return player
			.getEffects()
			.filter((e) => !INTERNAL_EFFECTS.has(e.typeId.replace('minecraft:', '')))
			.length;
	}

	/** Owner-driven tick: reconciles online members and applies the shared max-health pool. */
	static tickOwner(owner: Player): void {
		if (!owner?.isValid) return;

		const members = this.readMembers(owner);
		if (members.length === 0) {
			this.clearPool(owner);
			this.popLinkBar(owner);
			return;
		}

		const online: Player[] = [owner];
		for (const m of members) {
			const p = this.resolveOnline(m.id);
			if (!p) continue;
			online.push(p);
			this.ensureMemberFlags(p, owner);
		}

		// Persistent Prescience bar for every online participant, its level scaled to
		// the number of linked members (offline members still count toward the roster).
		for (const p of online) this.pushLinkBar(p, members.length);

		// The pool only applies while at least two participants are online; a lone
		// owner (all members offline) keeps their own base max health.
		if (online.length < 2) {
			this.clearPool(owner);
			return;
		}

		const sumBase = online.reduce((sum, p) => sum + this.baseMaxFor(p), 0);
		const bonus = Math.floor(sumBase / 2);

		for (const p of online) {
			const finalMax = this.clampHealth(this.baseMaxFor(p) + bonus);
			AttributeService.apply(p, { health: finalMax, outlineType: 'divine_aura' });
		}
	}

	private static ensureMemberFlags(member: Player, owner: Player): void {
		const state = PlayerState.for(member);
		state.setFlag(LinkFlag.Owner, JSON.stringify({ id: owner.id, name: owner.name }));
		if (state.getFlag<number>(LinkFlag.Base) === undefined) {
			state.setFlag(LinkFlag.Base, this.captureBase(member));
		}
	}

	private static captureBase(player: Player): number {
		const comp = this.healthOf(player);
		if (!comp) return BASE_MAX_HEALTH;
		return Math.max(MIN_BASE_HEALTH, Math.round(comp.effectiveMax));
	}

	/** Resets a participant to their base max health, clearing the member glow if not a Diviner. */
	private static clearPool(player: Player): void {
		if (!player?.isValid) return;
		const base = this.clampHealth(this.baseMaxFor(player));
		if (PlayerState.for(player).hasPower('divine_aura')) {
			AttributeService.apply(player, { health: base });
		} else {
			AttributeService.apply(player, { health: base, outlineType: 'none' });
		}
	}

	/** True if the player is an active pooled participant (owner online with 2+ online). */
	static isPooledParticipant(player: Player): boolean {
		const resolved = this.participantsOf(player);
		return !!resolved && resolved.participants.length >= 2;
	}

	private static clampHealth(value: number): number {
		return Math.max(MIN_BASE_HEALTH, Math.min(MAX_POOL_HEALTH, Math.round(value)));
	}

	/** Pushes/updates the persistent Prescience bar; its level scales with member count. */
	private static pushLinkBar(player: Player, memberCount: number): void {
		if (!player?.isValid) return;
		const state = PlayerState.for(player);
	
		const link = state.getFlag<number>('LinkFlag') ?? null;
		
		switch (memberCount) {
			case 3:
				if ( link === 3) {
					break;
				}

				ResourceBarService.push(player, {
					id: 26,
					from: BAR_FULL,
					to: BAR_FULL,
					persist: true
				});
				break;

			case 2:

				if (link === 2) {
					break;
				}

				ResourceBarService.push(player, {
					id: 26,
					from: BAR_TWO_THIRDS,
					to: BAR_TWO_THIRDS,
					persist: true
				});
				break;

			case 1:

				if (link === 1) {
					break;
				}

				ResourceBarService.push(player, {
					id: 26,
					from: BAR_ONE_THIRD,
					to: BAR_ONE_THIRD,
					persist: true
				});
				break;
				}
	}

	/** Removes the persistent Prescience bar if present. */
	private static popLinkBar(player: Player): void {
		if (!player?.isValid) return;
		const state = PlayerState.for(player);
		if (state.getFlag<number>(LinkFlag.BarLevel) === undefined) return;
		state.setFlag(LinkFlag.BarLevel, undefined);
		ResourceBarService.pop(player, LINK_BAR_ID);
	}


	//#region ROSTER

	/** Applies a new member roster chosen from the link UI, reconciling adds/removals. */
	static setMembers(owner: Player, next: readonly LinkMember[]): void {
		const previous = this.readMembers(owner);

		for (const m of next) {
			if (previous.some((o) => o.id === m.id)) continue;
			const p = this.resolveOnline(m.id);
			if (!p) continue;
			const state = PlayerState.for(p);
			state.setFlag(LinkFlag.Base, this.captureBase(p));
			state.setFlag(LinkFlag.Owner, JSON.stringify({ id: owner.id, name: owner.name }));
		}

		for (const o of previous) {
			if (next.some((m) => m.id === o.id)) continue;
			const p = this.resolveOnline(o.id);
			if (!p) continue;
			this.clearMember(p);
		}

		this.writeMembers(owner, next);
		if (next.length === 0) this.clearPool(owner);
		this.tickOwner(owner);
		this.log.info(`link roster updated by ${owner.name}: members: ${next.length}`);
	}

	private static clearMember(member: Player): void {
		this.clearPool(member);
		this.popLinkBar(member);
		const state = PlayerState.for(member);
		state.setFlag(LinkFlag.Owner, undefined);
		state.setFlag(LinkFlag.Base, undefined);
	}

	/** Dissolves the whole group owned by `owner` (e.g. on origin change). */
	static breakGroup(owner: Player): void {
		for (const m of this.readMembers(owner)) {
			const p = this.resolveOnline(m.id);
			if (p) this.clearMember(p);
		}
		this.writeMembers(owner, []);
		this.clearPool(owner);
		this.popLinkBar(owner);
	}


	//#region EVENTS

	@BeforeEntityHurt
	static onHurtBefore(ev: EntityHurtBeforeEvent): void {
		const victim = ev.hurtEntity;
		if (!(victim instanceof Player)) return;
		if (ev.damage <= 0) return;
		if (ev.damageSource.cause === EntityDamageCause.selfDestruct) return;

		const group = DivinerLink.resolveAegisGroup(victim);
		if (!group) return;
		const { owner, participants } = group;

		const share = ev.damage / participants.length;
		const aegisReady = !PlayerState.for(owner).isOnCooldown(AEGIS_KEY, system.currentTick);

		// Aegis: if any participant's share would be fatal and the cooldown is ready,
		// nullify the whole hit and protect them (deferred out of the before-event).
		// This applies even to a lone Diviner with no active link.
		const wouldKill = participants.some((p) => {
			const c = DivinerLink.healthOf(p);
			return !!c && share >= c.currentValue;
		});
		if (wouldKill && aegisReady) {
			ev.damage = 0;
			system.run(() => DivinerLink.triggerAegis(participants, owner));
			return;
		}

		// Oracle: distribute the hit evenly across a real link (2+ participants); the
		// victim keeps their share via the normal pipeline and the rest is applied
		// directly to the other members.
		if (participants.length < 2) return;
		ev.damage = share;
		const others = participants.filter((p) => p.id !== victim.id);
		system.run(() => {
			for (const p of others) {
				if (!p.isValid) continue;
				const c = DivinerLink.healthOf(p);
				if (!c) continue;
				DivinerLink.guard.add(p.id);
				try {
					c.setCurrentValue(Math.max(0, c.currentValue - share));
				} finally {
					DivinerLink.guard.delete(p.id);
				}
			}
		});
	}

	@AfterEntityHealthChanged
	static onHealthChanged(ev: EntityHealthChangedAfterEvent): void {
		const entity = ev.entity;
		if (!(entity instanceof Player)) return;
		if (DivinerLink.guard.has(entity.id)) return;

		const delta = ev.newValue - ev.oldValue;
		if (delta < 2) return;

		const resolved = DivinerLink.participantsOf(entity);
		if (!resolved) return;
		const { participants } = resolved;
		if (participants.length < 2) return;

		const share = delta / participants.length;
		const keep = ev.oldValue + share;
		const others = participants.filter((p) => p.id !== entity.id);

		system.run(() => {
			const hc = DivinerLink.healthOf(entity);
			if (hc && entity.isValid) {
				DivinerLink.guard.add(entity.id);
				try {
					hc.setCurrentValue(Math.min(hc.effectiveMax, Math.max(0.5, keep)));
				} finally {
					DivinerLink.guard.delete(entity.id);
				}
			}
			for (const p of others) {
				if (!p.isValid) continue;
				const c = DivinerLink.healthOf(p);
				if (!c) continue;
				DivinerLink.guard.add(p.id);
				try {
					c.setCurrentValue(Math.min(c.effectiveMax, c.currentValue + share));
				} finally {
					DivinerLink.guard.delete(p.id);
				}
			}
		});
	}

	@AfterPlayerSpawn
	static onSpawn(ev: PlayerSpawnAfterEvent): void {
		const player = ev.player;
		if (!player?.isValid) return;

		system.run(() => {
			if (!player.isValid) return;

			const ref = DivinerLink.readOwnerRef(player);
			if (ref) {
				const owner = DivinerLink.resolveOnline(ref.id);
				if (owner) {
					const members = DivinerLink.readMembers(owner);
					if (members.some((m) => m.id === player.id)) {
						DivinerLink.tickOwner(owner);
					} else {
						DivinerLink.clearMember(player);
					}
				} else {
					// Owner offline: the pool is inactive, so revert to base and hide the
					// bar but keep the link.
					DivinerLink.clearPool(player);
					DivinerLink.popLinkBar(player);
				}
			}

			if (DivinerLink.readMembers(player).length > 0) DivinerLink.tickOwner(player);
		});
	}

	@AfterPlayerLeave
	static onLeave(ev: PlayerLeaveAfterEvent): void {
		// When an owner logs off the pool goes inactive; revert their online members to
		// their base max health and hide the link bar until the owner returns.
		for (const player of Ticker.getPlayers()) {
			if (!player?.isValid) continue;
			const ref = DivinerLink.readOwnerRef(player);
			if (ref && ref.id === ev.playerId) {
				DivinerLink.clearPool(player);
				DivinerLink.popLinkBar(player);
			}
		}
	}


	//#region AEGIS

	private static triggerAegis(participants: readonly Player[], owner: Player): void {
		const now = system.currentTick;
		PlayerState.for(owner).setCooldown(AEGIS_KEY, now, AEGIS_COOLDOWN_TICKS);

		for (const p of participants) {
			if (!p.isValid) continue;

			const c = this.healthOf(p);
			if (c) {
				this.guard.add(p.id);
				try {
					c.setCurrentValue(Math.min(c.effectiveMax, Math.max(c.currentValue, 6)));
				} finally {
					this.guard.delete(p.id);
				}
			}

			p.addEffect(MinecraftEffectTypes.Absorption, AEGIS_BUFF_DURATION, { amplifier: 1, showParticles: false });
			p.addEffect(MinecraftEffectTypes.FireResistance, 800, { amplifier: 0, showParticles: false });

			PlayerState.for(p).setCooldown(AEGIS_KEY, now, AEGIS_COOLDOWN_TICKS);
			ResourceBarService.push(p, { id: AEGIS_BAR_ID, durationSeconds: 120 });

			p.playSound('random.totem', { volume: 1, pitch: 1 });
			p.runCommand('particle minecraft:totem_particle ~~1~');
		}
		this.log.info(`Aegis triggered for group of ${owner.name}: participants: ${participants.length}`);
	}


	//#region SWAP

	/** Swaps `owner` and `target` locations across dimensions and starts the cooldown. */
	static swap(owner: Player, target: Player): void {
		if (!owner?.isValid || !target?.isValid) return;

		const ownerLoc = { ...owner.location };
		const ownerDim = owner.dimension;
		const targetLoc = { ...target.location };
		const targetDim = target.dimension;

		owner.teleport(targetLoc, { dimension: targetDim });
		target.teleport(ownerLoc, { dimension: ownerDim });

		ownerDim.playSound('mob.endermen.portal', ownerLoc, { volume: 1, pitch: 0.8 });
		targetDim.playSound('mob.endermen.portal', targetLoc, { volume: 1, pitch: 0.8 });

		PlayerState.for(owner).setCooldown(INTERVENTION_KEY, system.currentTick, INTERVENTION_COOLDOWN_TICKS);
		ResourceBarService.push(owner, { id: INTERVENTION_BAR_ID, durationSeconds: 120 });
		this.log.info(`${owner.name} swapped with ${target.name}`);
	}


	//#region UI

	/**
	 * Opens the Prescience link picker. Up to three slots are shown, each revealed
	 * once the previous one is filled. Players already chosen in another slot are
	 * excluded from the remaining dropdowns; because a {@link CustomForm} item list
	 * is fixed per build, the form is re-rendered whenever a selection changes.
	 */
	static async openLinkForm(owner: Player): Promise<void> {
		const online = Ticker.getPlayers().filter(
			(p) => p.isValid && p.id !== owner.id && this.canBeLinked(owner, p)
		);
		const current = this.readMembers(owner);

		const candidates: LinkMember[] = [];
		const seen = new Set<string>();
		for (const p of online) {
			candidates.push({ id: p.id, name: p.name });
			seen.add(p.id);
		}
		for (const m of current) {
			if (seen.has(m.id)) continue;
			candidates.push({ ...m });
			seen.add(m.id);
		}

		const labelFor = (c: LinkMember): string | UIRawMessage =>
			this.resolveOnline(c.id)
				? c.name
				: { rawtext: [{ text: c.name }, { translate: 'origins.trait.prescience.form.offline' }] };
		const indexOf = (m: LinkMember | undefined): number =>
			m ? Math.max(0, candidates.findIndex((c) => c.id === m.id) + 1) : 0;

		// Stable selected values (0 = none, k = candidates[k-1]); this is the source of
		// truth across re-renders since each DropdownItemData carries a fixed value.
		const values = [indexOf(current[0]), indexOf(current[1]), indexOf(current[2])];

		for (let pass = 0; pass < 64 && owner.isValid; pass++) {
			this.normalizeLinkValues(values);

			const slotCount = 1 + (values[0] > 0 ? 1 : 0) + (values[1] > 0 ? 1 : 0);
			const observables: ObservableNumber[] = [];
			const outcome: { action: 'rerender' | 'confirm' | 'cancel' } = { action: 'cancel' };

			const form = new CustomForm(owner, { translate: 'origins.trait.prescience.name' });
			form.label({ translate: 'origins.trait.prescience.form.hint' });

			for (let slot = 0; slot < slotCount; slot++) {
				const observable = new ObservableNumber(values[slot], { clientWritable: true });
				observables.push(observable);

				const takenElsewhere = new Set<number>();
				values.forEach((v, i) => {
					if (i !== slot && v > 0) takenElsewhere.add(v);
				});

				const items: DropdownItemData[] = [
					{ label: { translate: 'origins.trait.prescience.form.none' }, value: 0 },
				];
				candidates.forEach((c, i) => {
					const value = i + 1;
					if (!takenElsewhere.has(value)) items.push({ label: labelFor(c), value });
				});

				form.dropdown(
					{ translate: 'origins.trait.prescience.form.slot', with: [String(slot + 1)] },
					observable,
					items
				);
			}

			const unsubscribes = observables.map((observable, slot) =>
				observable.subscribe((next) => {
					values[slot] = next;
					outcome.action = 'rerender';
					try {
						form.close();
					} catch {
						/* already closed */
					}
				})
			);

			form.button({ translate: 'origins.trait.prescience.form.confirm' }, () => {
				observables.forEach((observable, slot) => (values[slot] = observable.getData()));
				outcome.action = 'confirm';
				try {
					form.close();
				} catch {
					/* already closed */
				}
			});
			form.closeButton();

			const reason = await form.show();
			unsubscribes.forEach((cb, i) => observables[i].unsubscribe(cb));

			if (reason === DataDrivenScreenClosedReason.UserBusy) {
				await system.waitTicks(FORM_RETRY_TICKS);
				continue;
			}
			if (outcome.action === 'rerender') continue;
			if (outcome.action === 'confirm') {
				const chosen: LinkMember[] = [];
				const used = new Set<number>();
				for (const value of values) {
					if (value <= 0 || used.has(value)) continue;
					used.add(value);
					chosen.push(candidates[value - 1]);
				}
				this.setMembers(owner, chosen);
				owner.playSound('beacon.activate', { volume: 1, pitch: 1.2 });
			}
			return;
		}
	}

	/** Compacts non-zero link selections to the front and drops duplicates. */
	private static normalizeLinkValues(values: number[]): void {
		const compact: number[] = [];
		const used = new Set<number>();
		for (const v of values) {
			if (v > 0 && !used.has(v)) {
				used.add(v);
				compact.push(v);
			}
		}
		for (let i = 0; i < values.length; i++) values[i] = compact[i] ?? 0;
	}

	/**
	 * Opens the Intervention swap picker when more than two participants are
	 * linked; otherwise swaps directly with the single linked player.
	 */
	static async openInterventionForm(owner: Player): Promise<void> {
		const roster = this.readMembers(owner);
		const resolved = this.participantsOf(owner);
		const linked = resolved ? resolved.participants.filter((p) => p.id !== owner.id) : [];

		if (linked.length === 0) {
			OverheadText.show(
				owner,
				roster.length === 0
					? 'origins.trait.intervention.none'
					: 'origins.trait.intervention.offline'
			);
			owner.playSound('note.bass', { volume: 1, pitch: 0.5 });
			return;
		}

		if (linked.length === 1) {
			this.swap(owner, linked[0]);
			return;
		}

		const sel = new ObservableNumber(0, { clientWritable: true });
		const items: DropdownItemData[] = linked.map((p, i) => ({ label: p.name, value: i }));

		const form = new CustomForm(owner, { translate: 'origins.trait.intervention.name' });
		form.dropdown({ translate: 'origins.trait.intervention.form.target' }, sel, items);
		form.button({ translate: 'origins.trait.prescience.form.confirm' }, () => {
			const target = linked[sel.getData()] ?? linked[0];
			this.swap(owner, target);
			try {
				form.close();
			} catch {
				/* already closed */
			}
		});
		form.closeButton();

		await this.showForm(owner, form);
	}

	private static async showForm(player: Player, form: CustomForm): Promise<void> {
		for (let attempt = 0; attempt < FORM_MAX_RETRIES; attempt++) {
			if (!player.isValid) return;
			const reason = await form.show();
			if (reason === DataDrivenScreenClosedReason.UserBusy) {
				await system.waitTicks(FORM_RETRY_TICKS);
				continue;
			}
			return;
		}
	}
}
