
/** Player-scoped dynamic property keys. */
export enum PLAYER_DYNAMIC_PROPERTIES {
	/** Player's current origin id (e.g. "arachnid"). */
	origin = 'r4isen1920_originspe:origin',
	/** Player's current class id (e.g. "warrior"). */
	class = 'r4isen1920_originspe:class',
	/** JSON array of granted power ids. */
	powers = 'r4isen1920_originspe:powers',
	/** JSON array of granted perk ids. */
	perks = 'r4isen1920_originspe:perks',
	/** JSON array of granted control ids. */
	controls = 'r4isen1920_originspe:controls',
	/** JSON record of cooldown id -> tick at which the cooldown expires. */
	cooldowns = 'r4isen1920_originspe:cooldowns',
	/** JSON record of arbitrary boolean/number flags (transient state). */
	flags = 'r4isen1920_originspe:flags',
	/** Build id the player was last initialized for; triggers re-init on mismatch. */
	buildId = 'r4isen1920_originspe:r4ui_build_id',
	/** Whether the player has finished the welcome screen. */
	welcomed = 'r4isen1920_originspe:welcomed',
	/** Add-on version this player's OriginsPE record was last initialized for. */
	recordVersion = 'r4isen1920_originspe:record_version',
	/** JSON record backing up to 3 HUD resource bars for reconnect-safe rendering. */
	resourceBars = 'r4isen1920_originspe:resource_bars',
	/** Whether the player has admin permissions for the options menu. */
	admin = 'r4isen1920_originspe:admin',
}


/** World-scoped dynamic property keys. */
export enum WORLD_DYNAMIC_PROPERTIES {
	/** Build id the world was last initialized for. */
	buildId = 'r4isen1920_originspe:r4ui_build_id',
	/** JSON record of toggle option name -> 0/1. */
	toggles = 'r4isen1920_originspe:toggles',
	/** JSON record of `${kind}:${id}` -> 1 for banned origins/classes. */
	bans = 'r4isen1920_originspe:bans',
	/** Add-on version that should reset player records when they next join. */
	recordResetVersion = 'r4isen1920_originspe:record_reset_version',
}
