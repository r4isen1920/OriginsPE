import { Player, ScriptEventCommandMessageAfterEvent, ScriptEventSource } from '@minecraft/server';

import { SystemAfterScriptEventReceive } from '../core/platform/DecoratedEvents';
import { PlayerLifecycle } from '../core/abilities/PlayerLifecycle';
import { Log } from '../utils/Log';
import { Screen } from './screens/Screen';
import { PickerScreen } from './screens/PickerScreen';
import { BanScreen } from './screens/BanScreen';
import { OptionsScreen } from './screens/OptionsScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { AbilityWheelScreen } from './screens/AbilityWheelScreen';


//#region ROUTER

/**
 * This class is a thin dispatcher for the OriginsPE UI.
 * Buttons fire `scriptevent r4isen1920_originspe:ui <verb>:<args>`;
 * this router parses the verb and delegates to the {@link Screen} that owns it.
 *
 * Verb ownership:
 * | Screen             | Verbs                                              |
 * |--------------------|----------------------------------------------------|
 * | `PickerScreen`     | `nav` `pick` `viewed` `change` `open`              |
 * | `BanScreen`        | `ban` `unban`                                      |
 * | `OptionsScreen`    | `open_options` `toggle` `reset` `evict_unselected` `close` |
 * | `WelcomeScreen`    | `welcome`                                          |
 * | `AbilityWheelScreen` | `wheel`                                          |
 */
export class UiRouter {
	private static readonly log = Log.get('UiRouter', 'ui');

	private static readonly screens: readonly Screen[] = [
		new PickerScreen(),
		new BanScreen(),
		new OptionsScreen(),
		new WelcomeScreen(),
		new AbilityWheelScreen(),
	];

	private static readonly map: Map<string, Screen> = UiRouter.buildMap();

	private static buildMap(): Map<string, Screen> {
		const map = new Map<string, Screen>();
		for (const screen of this.screens) {
			for (const verb of screen.verbs) {
				if (map.has(verb)) this.log.warn(`verb '${verb}' registered by multiple screens`);
				map.set(verb, screen);
			}
		}
		return map;
	}

	@SystemAfterScriptEventReceive()
	static onEvent(ev: ScriptEventCommandMessageAfterEvent): void {
		if (ev.id !== 'r4isen1920_originspe:ui') return;
		const player = ev.sourceType === ScriptEventSource.Entity && ev.sourceEntity instanceof Player
			? ev.sourceEntity
			: undefined;
		if (!player) {
			this.log.warn('r4isen1920_originspe:ui fired without a player source; ignoring');
			return;
		}
		try {
			PlayerLifecycle.onJoinDialogueLoaded(player);
			this.route(player, String(ev.message ?? ''));
		} catch (e: any) {
			this.log.error(`dispatch '${ev.message}': `, e);
		}
	}

	/** Parses a colon-delimited UI message and delegates to the owning screen. */
	static route(player: Player, message: string): void {
		const parts = message.split(':');
		const verb = parts[0];
		const screen = this.map.get(verb);
		if (!screen) {
			this.log.warn(`unknown verb '${verb}' in '${message}'`);
			return;
		}
		screen.handle(player, parts);
	}
}
