import {
	CommandPermissionLevel,
	CustomCommand,
	CustomCommandOrigin,
	CustomCommandResult,
	CustomCommandStatus,
	Player,
	world,
} from '@minecraft/server';
import Meta from '../Meta';
import { BindThis, CustomCmd, OnWorldLoad } from '@bedrock-oss/stylish';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { WORLD_DYNAMIC_PROPERTIES } from '../Constants';
import { PlayerState } from '../core/PlayerState';
import { PickerKind, PickerMode, UiBridge } from '../core/UiBridge';



//#region Version
/**
 * Handles semantic versioning for the Add-On, allowing for easy comparison and retrieval of version information.
 */
export default class Version {
	private static _instance: Version;
	private static readonly log = Logger.getLogger('OriginsPE', 'Version');

	/** Full version in string format (e.g., "v1.0.0") */
	readonly version: string;
	/** Major version number. First digit. */
	readonly major: string;
	/** Minor version number. Second digit. */
	readonly minor: string;
	/** Patch version number. Third digit. */
	readonly patch: string;

	private constructor(version: string) {
		const [x, y, z] = version.replace(/[^0-9.]/g, '').split('.');
		this.major = x;
		this.minor = y;
		this.patch = z;
		this.version = version;
	}



	//#region Tracker

	private saveToWorld(): void {
		world.setDynamicProperty('r4isen1920_originspe:version', this.version);
	}

	private static setPlayerRecordResetVersion(version: string | undefined): void {
		world.setDynamicProperty(WORLD_DYNAMIC_PROPERTIES.recordResetVersion, version);
	}

	private static getPlayerRecordResetVersion(): string | undefined {
		const version = world.getDynamicProperty(WORLD_DYNAMIC_PROPERTIES.recordResetVersion);
		return typeof version === 'string' ? version : undefined;
	}

	@OnWorldLoad
	private static onWorldLoad(): void {
		const version = world.getDynamicProperty('r4isen1920_originspe:version');
		const savedVersion = typeof version === 'string' ? version : undefined;
		const currentVersion = Version.get();
		const comparison = savedVersion ? Version.compareTo(savedVersion) : -1;

		if (comparison < 0) {
			this.log.info(
				`World was loaded with older version (${version ?? 'unknown'}). Upgrading to ${currentVersion.version}.`
			);
			currentVersion.saveToWorld();
			this.onUpgrade(savedVersion);
		} else if (comparison > 0) {
			this.log.warn(
				`World was loaded with newer version (${version}). Downgrading to ${currentVersion.version}.`
			);
			currentVersion.saveToWorld();
			this.onDowngrade();
		} else {
			this.log.info(
				`World is up to date with ${currentVersion.version}.`
			);
		}

		this.log.info(`OriginsPE is running! Version: ${currentVersion.version}, commit: ${Meta.github.commit}`);
	}



	//#region Hooks

	private static onUpgrade(previousVersion: string | undefined) {
		const currentVersion = this.get();
		if (!this.hasMajorIncrement(previousVersion, currentVersion.version)) {
			this.log.info(
				`Version upgrade does not include a major increment. Player records will not queue for reset. previous version: ${previousVersion ?? 'unknown'}, current version: ${currentVersion.version}`
			);
			return;
		}

		this.setPlayerRecordResetVersion(currentVersion.version);
		this.log.info(
			`Player records will reset on next join for version: ${currentVersion.version}.`
		);
	}

	private static hasMajorIncrement(previousVersion: string | undefined, currentVersion: string): boolean {
		const previousMajor = this.getMajor(previousVersion);
		const currentMajor = this.getMajor(currentVersion);
		if (previousMajor === undefined || currentMajor === undefined) return false;
		return currentMajor > previousMajor;
	}

	private static getMajor(version: string | undefined): number | undefined {
		const parts = this.parseVersion(version);
		return parts?.major;
	}

	private static parseVersion(version: string | undefined): { major: number; minor: number; patch: number } | undefined {
		if (!version || !/^v?\d+\.\d+\.\d+$/.test(version)) return undefined;
		const [major, minor, patch] = version
			.replace(/[^0-9.]/g, '')
			.split('.')
			.map(Number);
		return { major, minor, patch };
	}

	private static onDowngrade() {
		this.setPlayerRecordResetVersion(undefined);
		this.log.info('Cleared pending player record reset after downgrade.');
	}



	//#region API
	/**
	 * Retrieves the current Version of this pack.
	 * The version is derived from the GitHub tag, or the manifest version if the tag is not available.
	 */
	public static get(): Version {
		if (!this._instance) {
			this._instance = new Version(
				Meta.github.tag || Meta.manifest.bp.version
			);
		}
		return this._instance;
	}

	/** Marks the player's record as current for the running add-on version. */
	public static markPlayerRecordCurrent(player: Player): void {
		const currentVersion = this.get().version;
		PlayerState.for(player).setRecordVersion(currentVersion);
	}

	/** Resets the player's OriginsPE record once for a pending upgrade reset. */
	public static resetPlayerRecordIfUpgradePending(player: Player): boolean {
		const resetVersion = this.getPlayerRecordResetVersion();
		if (!resetVersion) {
			this.log.debug(`No player record reset pending for player: ${player.name}`);
			return false;
		}

		const resetMajor = this.getMajor(resetVersion);
		if (resetMajor === undefined) {
			this.log.warn(`Invalid player record reset version: ${resetVersion}`);
			this.setPlayerRecordResetVersion(undefined);
			return false;
		}

		const currentVersion = this.get().version;
		const state = PlayerState.for(player);
		const recordMajor = this.getMajor(state.getRecordVersion());
		if (recordMajor !== undefined && recordMajor >= resetMajor) {
			this.log.debug(
				`Player record already reset for major version: ${resetMajor}, player: ${player.name}`
			);
			return false;
		}

		try {
			this.log.info(`Resetting player record for version: ${resetVersion}, player: ${player.name}`);
			state.reset();
			state.setRecordVersion(currentVersion);
			UiBridge.openPicker(player, PickerKind.Race, PickerMode.Pick);
			return true;
		} catch (e: any) {
			this.log.error(
				`Failed to reset player record for version: ${resetVersion}, player: ${player.name}, error: ${e?.stack ?? e}`
			);
			return false;
		}
	}

	/**
	 * Determines if the current version is greater than or equal to the specified version.
	 *
	 * @param version The version to compare against, in the format "x.y.z" or "vX.Y.Z".
	 * @returns
	 * The number of version segments that are greater than the provided version.
	 * Returns 0 if the current version is equal to the provided version, a positive number if the current version is greater, and a negative number if it is lesser.
	 * Returns -1 if the provided version is in an invalid format, or does not exist.
	 */
	public static compareTo(version: string): number {
		// check if the version provided in the args is valid
		if (!/^v?\d+\.\d+\.\d+$/.test(version)) {
			return -1; // Invalid version format, treat as lesser; requires update
		}

		const current = this.get();
		const [x, y, z] = version
			.replace(/[^0-9.]/g, '')
			.split('.')
			.map(Number);
		const [currX, currY, currZ] = [
			current.major,
			current.minor,
			current.patch,
		].map(Number);

		if (currX !== x) return x - currX;
		if (currY !== y) return y - currY;
		if (currZ !== z) return z - currZ;
		return 0; // versions are equal
	}
}

//#region Command
/**
 * Handles the command to display the current version of the Add-On.
 */
@CustomCmd
export class VersionCommand implements CustomCommand {
	readonly name = 'r4isen1920_originspe:version';
	readonly description =
		'Displays the current version of the OriginsPE Add-On.';
	readonly permissionLevel = CommandPermissionLevel.Any;

	@BindThis
	run(_origin: CustomCommandOrigin): CustomCommandResult {
		const msgBody =
			`OriginsPE is running on ${Version.get().version}! ` +
			`(commit: ${Meta.github.commit})`;

		return {
			status: CustomCommandStatus.Success,
			message: msgBody,
		};
	}
}
