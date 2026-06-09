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
	buildId: `${DP_NS}:r4ui_build_id`,
	/** Whether the player has finished the welcome screen. */
	welcomed: `${DP_NS}:welcomed`,
	/** Add-on version this player's OriginsPE record was last initialized for. */
	recordVersion: `${DP_NS}:record_version`,
	/** JSON record backing up to 3 HUD resource bars for reconnect-safe rendering. */
	resourceBars: `${DP_NS}:resource_bars`,
	/** Whether the player has admin permissions for the options menu. */
	admin: `${DP_NS}:admin`,
} as const;


//#region WORLD DP KEYS

/** World-scoped dynamic properties. Replaces the legacy `index` scoreboard. */
export const WORLD_DPK = {
	/** Build id the world was last initialized for. */
	buildId: `${DP_NS}:r4ui_build_id`,
	/** JSON record of toggle option name -> 0/1. */
	toggles: `${DP_NS}:toggles`,
	/** JSON record of `${kind}:${id}` -> 1 for banned origins/classes. */
	bans: `${DP_NS}:bans`,
	/** Add-on version that should reset player records when they next join. */
	recordResetVersion: `${DP_NS}:record_reset_version`,
} as const;


//#region UI EVENTS

/**
 * Single scriptevent id used by every dialogue button to call back into TS.
 * Payload syntax: `<verb>[:<arg>...]` (colon-delimited). See {@link UiEventRouter}.
 */
export const UI_EVENT = `${NS}:ui` as const;

/**
 * Magic prefix on the picker dialogue `text` field (exposed in JSON UI as
 * `#dialogtext`). Layout: `_op:picker.<mode><kind><difficulty><id>`.
 *
 * - chars 0..10 -- magic `'_op:picker.'`
 * - char  11    -- mode: `p` pick, `c` change, `v` view, `b` ban
 * - char  12    -- kind: `r` race, `c` class
 * - char  13    -- difficulty: `a` human, `b` easy, `c` medium, `d` hard,
 *                 `e` random_race, `f` nitwit, `g` fair, `h` decent,
 *                 `i` very, `j` (fallback)
 * - chars 14..  -- being id (variable-length, no padding)
 */
export const UI_PAYLOAD = {
	prefix: '_op:picker.',
	prefixLen: 11,
	modeOffset: 11,
	kindOffset: 12,
	diffOffset: 13,
	idOffset: 14,
	mode: {
		pick: 'p', pick_ban: 'p', pick_lock: 'p',
		change: 'c',
		view: 'v',
		banned: 'b', unbanned: 'u', ban_limit: 'b', ban_locked: 'b',
		ban: 'b', // legacy virtual entry-point token
	},
	kind: { race: 'r', class: 'c' },
} as const;


//#region ABILITY WHEEL

/**
 * Magic prefix + fixed layout for the ability wheel payload pushed via
 * `player.onScreenDisplay.setTitle(...)` and read in JSON UI as `#title_text`.
 *
 * Layout (total length {@link ABILITY_WHEEL.length}):
 *
 * - chars 0..7  -- magic prefix `'_op:abw.'`
 * - char  8     -- selected slot digit `'0'..'4'`, or `'n'` when nothing is
 *                  highlighted.
 * - chars 9..18 -- five 2-char icon fields, one per slot. Slot 0 is the options
 *                  slot (`'op'`); slots 1..4 hold a cooldown-atlas icon id, or
 *                  `'--'` when the slot is empty.
 */
export const ABILITY_WHEEL = {
	prefix: '_op:abw.',
	/** Slot count (slot 0 = options, slots 1..4 = active abilities). */
	slots: 5,
	/** Width in chars of each icon field. */
	iconWidth: 2,
	/** Absolute index of the selected-slot digit. */
	selectedOffset: 8,
	/** Absolute index where the first icon field begins. */
	iconsOffset: 9,
	/** Total payload length. */
	length: 19,
	/** Icon id for the always-present options slot. */
	optionsIcon: 'op',
	/** Icon id for an empty ability slot. */
	emptyIcon: '--',
	/** Selected-slot value meaning "nothing highlighted". */
	noneSelected: 'n',
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

