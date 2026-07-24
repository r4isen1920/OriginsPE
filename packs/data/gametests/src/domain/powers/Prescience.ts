import { Player } from '@minecraft/server';

import { Power } from '../../core/abilities/Ability';
import { RegisterPower } from '../../core/abilities/Registries';
import { PlayerState } from '../../core/platform/PlayerState';
import { Log } from '../../utils/Log';
import { DivinerLink } from './DivinerLink';


/**
 * Prescience: active Diviner power. Opens the link picker to bind up to three
 * other players into a shared health pool managed by {@link DivinerLink}.
 */
@RegisterPower
export class Prescience implements Power {
	private static readonly log = Log.get('Prescience');

	readonly id = 'prescience';
	readonly tickInterval = 6;

	readonly active = {
		icon: '26',
		name: 'origins.trait.prescience.name',
	};

	onActivate(player: Player): void {
		if (PlayerState.for(player).getOrigin() !== 'diviner') return;
		DivinerLink.openLinkForm(player).catch((e) =>
			Prescience.log.error(`openLinkForm failed for ${player.name}: ${e}`)
		);
	}

	onTick(player: Player): void {
		if (!player?.isValid) return;
		if (DivinerLink.readMembers(player).length > 0) DivinerLink.tickOwner(player);
	}

	onRelease(player: Player): void {
		DivinerLink.breakGroup(player);
	}
}
