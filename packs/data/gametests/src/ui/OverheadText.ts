import { Player } from "@minecraft/server";
import { Log } from "../utils";



//#region OverheadText
/***
 * Handles overhead text messages for players in the game.
 * An overhead text is a label that appears around above the title text and is used to
 * deliver informational messages to the players in-game.
 */
export default class OverheadText {
	private static readonly log = Log.get('OverheadText');
	
	private static readonly OVERHEAD_TEXT_PREFIX = '_op:overhead_text.';


	/**
	 * Displays an overhead text message to the specified player
	 */
	static show(player: Player, text: string): void {
		player.onScreenDisplay.setActionBar(
			this.OVERHEAD_TEXT_PREFIX + text
		);
	}

}