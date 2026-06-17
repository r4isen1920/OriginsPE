import {
	CommandPermissionLevel,
	CustomCommand,
	CustomCommandOrigin,
	CustomCommandParamType,
	CustomCommandResult,
	CustomCommandStatus,
} from '@minecraft/server';
import { CustomCmd } from '@bedrock-oss/stylish';

import { Log } from '../utils/Log';
import { PlayerState } from './PlayerState';
import { ClassRegistry, OriginRegistry } from '../domain/Registries';
import { PlayerLifecycle } from '../domain/PlayerLifecycle';


const log = Log.get('Commands');


//#region setorigin

/**
 * `/r4isen1920_originspe:setorigin <originId>` - admin override for the executing player's origin.
 */
@CustomCmd
export class SetOriginCommand implements CustomCommand {
	readonly name = 'r4isen1920_originspe:setorigin';
	readonly description = 'Sets the executing player\'s origin.';
	readonly permissionLevel = CommandPermissionLevel.GameDirectors;
	readonly mandatoryParameters = [
		{ name: 'originId', type: CustomCommandParamType.String },
	];

	run(origin: CustomCommandOrigin, originId: string): CustomCommandResult {
		const player = origin.sourceEntity;
		if (!player || player.typeId !== 'minecraft:player') {
			return { status: CustomCommandStatus.Failure, message: 'Must be run as a player.' };
		}
		if (!OriginRegistry.has(originId)) {
			return { status: CustomCommandStatus.Failure, message: `Unknown origin: ${originId}` };
		}
		PlayerState.for(player as any).setOrigin(originId);
		PlayerLifecycle.applyOriginAndClass(player as any);
		log.info(`Set origin '${originId}' on ${player.nameTag}`);
		return { status: CustomCommandStatus.Success };
	}
}


//#region setclass

/**
 * `/r4isen1920_originspe:setclass <classId>` - admin override for the executing player's class.
 */
@CustomCmd
export class SetClassCommand implements CustomCommand {
	readonly name = 'r4isen1920_originspe:setclass';
	readonly description = 'Sets the executing player\'s class.';
	readonly permissionLevel = CommandPermissionLevel.GameDirectors;
	readonly mandatoryParameters = [
		{ name: 'classId', type: CustomCommandParamType.String },
	];

	run(origin: CustomCommandOrigin, classId: string): CustomCommandResult {
		const player = origin.sourceEntity;
		if (!player || player.typeId !== 'minecraft:player') {
			return { status: CustomCommandStatus.Failure, message: 'Must be run as a player.' };
		}
		if (!ClassRegistry.has(classId)) {
			return { status: CustomCommandStatus.Failure, message: `Unknown class: ${classId}` };
		}
		PlayerState.for(player as any).setClass(classId);
		PlayerLifecycle.applyOriginAndClass(player as any);
		log.info(`Set class '${classId}' on ${player.nameTag}`);
		return { status: CustomCommandStatus.Success };
	}
}


//#region debug

/**
 * `/r4isen1920_originspe:debug` - dumps the executing player's state to the chat log.
 */
@CustomCmd
export class DebugCommand implements CustomCommand {
	readonly name = 'r4isen1920_originspe:debug';
	readonly description = 'Logs OriginsPE state for the executing player.';
	readonly permissionLevel = CommandPermissionLevel.GameDirectors;

	run(origin: CustomCommandOrigin): CustomCommandResult {
		const player = origin.sourceEntity;
		if (!player || player.typeId !== 'minecraft:player') {
			return { status: CustomCommandStatus.Failure, message: 'Must be run as a player.' };
		}
		const s = PlayerState.for(player as any);
		const summary = {
			origin: s.getOrigin(),
			class: s.getClass(),
			powers: s.getPowers(),
			perks: s.getPerks(),
			welcomed: s.isWelcomed(),
		};
		log.info(JSON.stringify(summary, null, 2));
		return { status: CustomCommandStatus.Success, message: JSON.stringify(summary) };
	}
}
