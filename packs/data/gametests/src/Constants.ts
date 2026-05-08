/**
 * Compile-time constants and well-known string keys used across the pack.
 * Keep all hard-coded ids, prefixes, and dynamic-property names here.
 *
 * Scoreboard usage policy: dynamic properties are the source of truth for all
 * gameplay state. The only scoreboards that exist are a small "render bridge"
 * (see {@link RENDER_SB}) consumed by RP animation controllers. The script
 * runtime writes to those scoreboards but never reads from them.
 */


//#region NAMESPACE

/** Add-on namespace prefix used for items, entities, events, etc. */
export const NS = 'r4isen1920_originspe';

/** Short prefix used for dynamic property and command keys. */
export const DP_NS = 'op';


//#region PLAYER DP KEYS

/**
 * Typed registry of every player-scoped dynamic property key used by the pack.
 * Using a const map (instead of scattered string literals) prevents typos.
 */
export const DPK = {
	/** Player's current origin id (e.g. "arachnid"). */
	origin: `${DP_NS}:origin`,
	/** Player's current class id (e.g. "warrior"). */
	class: `${DP_NS}:class`,
	/** JSON array of granted power ids. */
	powers: `${DP_NS}:powers`,
	/** JSON array of granted perk ids. */
	perks: `${DP_NS}:perks`,
	/** JSON array of granted control ids. */
	controls: `${DP_NS}:controls`,
	/** JSON record of cooldown id -> tick at which the cooldown expires. */
	cooldowns: `${DP_NS}:cooldowns`,
	/** JSON record of arbitrary boolean/number flags (transient state). */
	flags: `${DP_NS}:flags`,
	/** Build id the player was last initialized for; triggers re-init on mismatch. */
	buildId: `${DP_NS}:build_id`,
	/** Whether the player has finished the welcome screen. */
	welcomed: `${DP_NS}:welcomed`,
} as const;


//#region WORLD DP KEYS

/** World-scoped dynamic properties. Replaces the legacy `index` scoreboard. */
export const WORLD_DPK = {
	/** Build id the world was last initialized for. */
	buildId: `${DP_NS}:build_id`,
	/** JSON record of toggle option name -> 0/1. */
	toggles: `${DP_NS}:toggles`,
} as const;


//#region RENDER BRIDGE

/**
 * Scoreboard objectives the RP animation controllers (resource bar HUD) read
 * via molang `q.scoreboard(...)`. The script runtime only writes to these.
 *
 * Do NOT read from these in TypeScript; mirror them onto dynamic properties
 * via {@link DPK} instead.
 */
export const RENDER_SB = {
	/** Per-player render-ready flag (0 = not ready, 1 = ready). */
	gui: 'gui',
	/** Constants table referenced by animations. */
	var: 'var',
	/** Active push channel. */
	cd: 'cd',
	cdFrom: 'cdfrom',
	cdTo: 'cdto',
	cdDuration: 'cdduration',
	cdPersist: 'cdpersist',
	cdHide: 'cdhide',
	cd1: 'cd1', cd1From: 'cd1from', cd1To: 'cd1to', cd1Duration: 'cd1duration', cd1Persist: 'cd1persist',
	cd2: 'cd2', cd2From: 'cd2from', cd2To: 'cd2to', cd2Duration: 'cd2duration', cd2Persist: 'cd2persist',
	cd3: 'cd3', cd3From: 'cd3from', cd3To: 'cd3to', cd3Duration: 'cd3duration', cd3Persist: 'cd3persist',
} as const;

