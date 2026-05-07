import { Logger as BoostLogger } from '@bedrock-oss/bedrock-boost';


/**
 * Custom logging wrapper for the Add-On.
 */
export class Log {
	/**
	 * Retrives the logger for the given subsystem.
	 * 
	 * @param whatFor
	 * What subsystem the logger is for. Used as part of the logger's name, and to group log messages in the console.
	 */
	static get(whatFor: string) {
		return BoostLogger.getLogger('OriginsPE', whatFor);
	}
}
