import { Player, system, TicksPerSecond } from '@minecraft/server';

import { PlayerTick } from '../core/platform/Ticker';
import { AttributeService } from './AttributeService';
import { ModelType } from './Attributes';
import { EntityProperties } from '../Files';
import { Log } from '../utils';



/**
 * Manages dynamic geometry/model switching for players.
 * 
 * Application of model is applied to the {@link AttributeService} still.
 * However, this serves as a layer to manage the timing of the transition state.
 */
export class ModelService {
    private static readonly stateCache = new Map<string, ModelChangeEntry>();
	private static readonly log = Log.get('ModelService');

    /**
     * How long to wait before the model can be changed again.
     * This is the duration of the transition animation also.
     */
    private static readonly COOLDOWN_BEFORE_REAPPLY = TicksPerSecond * 0.75;


	//#region API

    /**
     * Returns `true` if this player is currently in the middle of model transition.
	 * 
	 * The player is considered in a transition state for {@link ModelService.TOTAL_COOLDOWN} ticks
	 * after the last model change.
     */
    public static isTransitioning(player: Player): boolean {
        return this.stateCache.get(player.id)?.isTransitioning ?? false;
    }


    //#region TICK

    @PlayerTick(1)
    static onTick(player: Player): void {
        const playerId = player.id;
        let modelType = AttributeService.getApplied(playerId).modelType;

        const now = system.currentTick;
        let entry = this.stateCache.get(playerId);

        if (!entry) {
			// auto-populate the model type from the player's property if not yet cached
			modelType = modelType ?? (player.getProperty(EntityProperties.Player.ModelType) as ModelType);
			entry = {
                modelType,
                expiresAt: 0,
                isTransitioning: false
            };
            this.stateCache.set(playerId, entry);
			this.log.debug(`Init model state: ${modelType}, for: ${player.name}`);
        }
		if (!modelType) return;

        const hasChanged = entry.modelType !== modelType;

        if (hasChanged) {
            entry.modelType = modelType;

			// if changed now while in cd, increment the expiration time by the transition duration to account for that
			// as this class does not really prohibit rapid changes, it just ensures the transition state is applied for a minimum duration
            if (now < entry.expiresAt) {
                entry.expiresAt += this.COOLDOWN_BEFORE_REAPPLY;
            } else {
                entry.expiresAt = now + this.COOLDOWN_BEFORE_REAPPLY;
            }

            if (!entry.isTransitioning) {
                entry.isTransitioning = true;
                player.setProperty(EntityProperties.Player.ModelTypeTransitioning, true);
            }
        } else {
            // model hasn't changed. check if the active transition period has expired
            if (entry.isTransitioning && now >= entry.expiresAt) {
                entry.isTransitioning = false;
                player.setProperty(EntityProperties.Player.ModelTypeTransitioning, false);
            }
        }
    }
}



//#region Types
interface ModelChangeEntry {
    /** The last applied model type for the player */
    modelType: ModelType;
    /** The exact system tick when the transition state will expire */
    expiresAt: number;
    /** Cached boolean representing the transitioning state to avoid native API calls */
    isTransitioning: boolean;
}