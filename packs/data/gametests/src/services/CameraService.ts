import { Player } from '@minecraft/server';
import { Vec3, Logger } from '@bedrock-oss/bedrock-boost';

import { PlayerTick } from '../core/platform/Ticker';
import { OnWorldLoad } from '@bedrock-oss/stylish';
import { AttributeService } from './AttributeService';
import { DEFAULT_ATTRIBUTES, STEPPED_ATTRIBUTES } from './Attributes';
import { MinecraftEffectTypes } from '@minecraft/vanilla-data';


const log = Logger.getLogger('TDEW', 'CameraService');


/**
 * Manages dynamic camera preset switching for players.
 */
export class CameraService {
	private static readonly lastApplied = new Map<string, string>();


	//#region PRESETS

	/**
	 * Builds the namespaced camera preset id for the given scale and crawling state.
	 * The scale is snapped to the nearest valid step.
	 */
	static buildCameraPreset(scale: number, isCrawling: boolean): string {
		const steps = STEPPED_ATTRIBUTES.scale!.steps;
		let snapped = steps[0];
		let best = Math.abs(scale - snapped);
		for (let i = 1; i < steps.length; i++) {
			const d = Math.abs(scale - steps[i]);
			if (d < best) { best = d; snapped = steps[i]; }
		}
		return `r4isen1920_originspe:${isCrawling ? 'crawling' : 'standing'}_${snapped.toString().replace('.', '_')}`;
	}

	/**
	 * Immediately clears the camera and removes any explicit override from
	 * {@link AttributeService}'s cache so the next tick does not re-apply it.
	 */
	static clearCamera(player: Player): void {
		AttributeService.apply(player, { camera: undefined });
		this.clear(player);
	}

	/** Drops the diff-cache entry for `playerId` on player leave. */
	static forget(playerId: string): void {
		this.lastApplied.delete(playerId);
	}

	@OnWorldLoad
	private static onWorldLoad(): void {
		this.lastApplied.clear();
	}


	//#region TICK

	@PlayerTick(1)
	static onTick(player: Player): void {
		const attrs = AttributeService.getApplied(player.id);

		// Explicit camera override takes priority over auto-derive.
		if (attrs.camera != null) {
			this.apply(player, attrs.camera);
			return;
		}

		const scale = attrs.scale ?? DEFAULT_ATTRIBUTES.scale;
		if (scale === DEFAULT_ATTRIBUTES.scale) {
			this.clear(player);
			return;
		}

		const raycast = player.dimension.getBlockFromRay(player.location, Vec3.Up, {
			includePassableBlocks: false,
			includeLiquidBlocks: false,
			maxDistance: 1.5,
		});
		const isCrawling = raycast ? 
			(raycast.block !== undefined && !raycast.block.isAir) : false;
		this.apply(player, this.buildCameraPreset(scale, isCrawling));

		//? in certain scenarios, the player will still be forced into crawl mode even if,
		//? technically, they should be standing. This is a hacky workaround to give them a
		//? speed boost if they are crawling and small.
		if (isCrawling && scale < 0.5) {
			player.addEffect(MinecraftEffectTypes.Speed, 20, {
				amplifier: 2,
				showParticles: false
			});
		}
	}


	//#region INTERNAL

	private static apply(player: Player, preset: string): void {
		if (this.lastApplied.get(player.id) === preset) return;
		this.lastApplied.set(player.id, preset);
		log.debug(`camera preset: ${preset} for player: ${player.name}`);
		try {
			player.camera.setCamera(preset);
			this.setActiveProperty(player, true);
		} catch (e: any) {
			log.error(`setCamera '${preset}' failed for player: ${player.name}: ${e}`);
		}
	}

	private static clear(player: Player): void {
		if (!this.lastApplied.has(player.id)) return;
		this.lastApplied.delete(player.id);
		log.debug(`camera cleared for player: ${player.name}`);
		try {
			player.camera.clear();
			this.setActiveProperty(player, false);
		} catch (e: any) {
			log.error(`camera.clear failed for player: ${player.name}: ${e}`);
		}
	}

	/** Toggles the client-synced flag that hides the local player's own model. */
	private static setActiveProperty(player: Player, active: boolean): void {
		try {
			player.setProperty('r4isen1920_originspe:camera_active', active);
		} catch (e: any) {
			log.error(`setProperty camera_active = ${active} failed for player: ${player.name}: ${e}`);
		}
	}
}
