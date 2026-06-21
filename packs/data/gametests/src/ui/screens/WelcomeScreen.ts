import { Player } from '@minecraft/server';

import { Log } from '../../utils/Log';
import { UiBridge } from '../UiBridge';
import { PlayerState } from '../../core/platform/PlayerState';
import { Screen } from './Screen';


//#region WELCOME SCREEN

/**
 * Handles the welcome screen, which is shown to players on their first join.
 */
export class WelcomeScreen extends Screen {
	private static readonly log = Log.get('WelcomeScreen', 'ui');

	readonly verbs = ['welcome'] as const;

	handle(player: Player, [, action, state]: string[]): void {
		switch (action) {
			case 'close':
				PlayerState.for(player).setWelcomed(state === 'ignored');
				UiBridge.closeScreen(player);
				return;
			case 'ignore':
				UiBridge.openDialogue(player, 'gui_welcome_screen_ignore');
				return;
			case 'unignore':
				UiBridge.openDialogue(player, 'gui_welcome_screen');
				return;
			default:
				WelcomeScreen.log.warn(`unknown welcome action '${action}'`);
		}
	}
}
