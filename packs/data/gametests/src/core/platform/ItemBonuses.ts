import { ItemStack, RawMessage } from '@minecraft/server';
import { Log } from '../../utils';



/**
 * This class provides a way to mark items with bonuses and display them on item lore.
 * The bonus is stored in the item's lore as a translation key, and can be queried or removed later.
 */
export class ItemBonuses {
	private static readonly log = Log.get('ItemBonuses');


	//#region FORMAT

	private static readonly RESET = '§r';
	private static readonly HEADING_COLOR = '§7';
	private static readonly ENTRY_COLOR = '§3';
	private static readonly ENTRY_INDENT = ' ';

	/** Blank line that opens the block. */
	private static readonly PADDING = ItemBonuses.RESET;

	private static readonly HEADING_KEY = 'origins.item_lore.bonuses';
	private static readonly ENTRY_PATTERN = /^origins\.trait\.(.+)\.item_lore$/;

	/** Returns the translation key that names the given bonus on item lore. */
	static keyOf(bonus: string): string {
		return `origins.trait.${bonus}.item_lore`;
	}


	//#region QUERY

	/** Returns every bonus stamped on the item, in display order. */
	static getBonuses(item: ItemStack): string[] {
		return ItemBonuses.split(item.getRawLore()).bonuses;
	}

	/** Returns true when the item carries the given bonus. */
	static hasBonus(item: ItemStack, bonus: string): boolean {
		return ItemBonuses.getBonuses(item).includes(bonus);
	}

	/** Returns true when the item carries any bonus from this Add-On. */
	static isMarked(item: ItemStack): boolean {
		return ItemBonuses.getBonuses(item).length > 0;
	}


	//#region MUTATE

	/**
	 * Returns a copy of the item carrying the bonus, or `undefined` when the
	 * item already has it or the lore could not be written.
	 */
	static mark(item: ItemStack, bonus: string): ItemStack | undefined {
		const { extra, bonuses } = ItemBonuses.split(item.getRawLore());
		if (bonuses.includes(bonus)) return undefined;

		bonuses.push(bonus);
		const copy = item.clone();
		if (!ItemBonuses.commit(copy, extra, bonuses)) return undefined;

		ItemBonuses.log.debug(`Marked bonus: ${bonus}, item: ${item.typeId}`);
		return copy;
	}

	/**
	 * Returns a copy of the item without the bonus, or `undefined` when the
	 * item never had it or the lore could not be written.
	 */
	static unmark(item: ItemStack, bonus: string): ItemStack | undefined {
		const { extra, bonuses } = ItemBonuses.split(item.getRawLore());
		const index = bonuses.indexOf(bonus);
		if (index === -1) return undefined;

		bonuses.splice(index, 1);
		const copy = item.clone();
		if (!ItemBonuses.commit(copy, extra, bonuses)) return undefined;

		ItemBonuses.log.debug(`Unmarked bonus: ${bonus}, item: ${item.typeId}`);
		return copy;
	}

	/** Replaces the item's bonus block in place, keeping unrelated lore. */
	static write(item: ItemStack, bonuses: (string)[]): void {
		const { extra } = ItemBonuses.split(item.getRawLore());
		ItemBonuses.commit(item, extra, [...new Set(bonuses)]);
	}


	//#region INTERNALS

	private static commit(item: ItemStack, extra: RawMessage[], bonuses: (string)[]): boolean {
		try {
			item.setLore(ItemBonuses.compose(extra, bonuses));
			return true;
		} catch (e) {
			ItemBonuses.log.error(`Failed to write bonus lore for ${item.typeId}: ${e}`);
			return false;
		}
	}

	private static compose(extra: RawMessage[], bonuses: (string)[]): RawMessage[] {
		if (bonuses.length === 0) return extra;

		return [
			...extra,
			{ text: ItemBonuses.PADDING },
			{
				rawtext: [
					{ text: `${ItemBonuses.RESET}${ItemBonuses.HEADING_COLOR}` },
					{ translate: ItemBonuses.HEADING_KEY },
				],
			},
			...bonuses.map<RawMessage>(bonus => ({
				rawtext: [
					{ text: `${ItemBonuses.RESET}${ItemBonuses.ENTRY_INDENT}${ItemBonuses.ENTRY_COLOR}` },
					{ translate: ItemBonuses.keyOf(bonus) },
				],
			})),
		];
	}

	/** Peels the bonus block off the lore, leaving everything else untouched. */
	private static split(lore: RawMessage[]): { extra: RawMessage[]; bonuses: string[] } {
		const extra: RawMessage[] = [];
		const bonuses: string[] = [];

		for (const line of lore) {
			const key = ItemBonuses.translateKeyOf(line);
			if (key === ItemBonuses.HEADING_KEY) continue;

			const match = key ? ItemBonuses.ENTRY_PATTERN.exec(key) : undefined;
			if (match) {
				if (!bonuses.includes(match[1])) bonuses.push(match[1]);
				continue;
			}

			if (!key && !line.rawtext && line.text === ItemBonuses.PADDING) continue;

			extra.push(line);
		}

		return { extra, bonuses };
	}

	private static translateKeyOf(line: RawMessage): string | undefined {
		if (line.translate) return line.translate;
		return line.rawtext?.find(part => part.translate !== undefined)?.translate;
	}
}
