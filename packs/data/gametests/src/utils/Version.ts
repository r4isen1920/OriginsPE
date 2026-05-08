import {
	CommandPermissionLevel,
	CustomCommand,
	CustomCommandOrigin,
	CustomCommandResult,
	CustomCommandStatus,
	world,
} from '@minecraft/server';
import Meta from '../Meta';
import { BindThis, CustomCmd, OnWorldLoad } from '@bedrock-oss/stylish';
import { Logger } from '@bedrock-oss/bedrock-boost';
import { NS } from '../Constants';



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
		world.setDynamicProperty('xp_furniture:version', this.version);
	}

	@OnWorldLoad
	private static onWorldLoad(): void {
		const version = world.getDynamicProperty('xp_furniture:version');
		const currentVersion = Version.get();
		const comparison =
			typeof version === 'string' ? Version.compareTo(version) : -1;

		if (comparison < 0) {
			this.log.info(
				`World was loaded with older version (${version ?? 'unknown'}). Upgrading to ${currentVersion.version}.`
			);
			currentVersion.saveToWorld();
			this.onUpgrade();
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

		this.log.info('OriginsPE is running!');
	}



	//#region Hooks

	private static onUpgrade() {
		// TODO: add logic here to handle any necessary updates when the version upgrades
	}

	private static onDowngrade() {
		// TODO: add logic here to handle any necessary updates when the version downgrades
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
	readonly name = `${NS}:version`;
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
