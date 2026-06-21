
/**
 * Generic immutable registry for domain singletons keyed by id.
 * Use {@link Registry.lock} after all entries are registered to freeze it.
 */
export class Registry<T extends { id: string }> {
	private readonly items = new Map<string, T>();
	private locked = false;

	constructor(public readonly name: string) {}

	/** Adds an entry. Throws on duplicate id or post-lock mutation. */
	register(item: T): void {
		if (this.locked) throw new Error(`[Registry:${this.name}] cannot register '${item.id}' after lock`);
		if (this.items.has(item.id)) throw new Error(`[Registry:${this.name}] duplicate id '${item.id}'`);
		this.items.set(item.id, item);
	}

	/** Returns the entry with the given id, or `undefined`. */
	get(id: string): T | undefined {
		return this.items.get(id);
	}

	/** Returns true if the registry contains the given id. */
	has(id: string): boolean {
		return this.items.has(id);
	}

	/** Snapshot of all registered entries (frozen array). */
	all(): readonly T[] {
		return Object.freeze([...this.items.values()]);
	}

	/** All registered ids. */
	ids(): readonly string[] {
		return Object.freeze([...this.items.keys()]);
	}

	/** Prevents further mutation. */
	lock(): void {
		this.locked = true;
	}
}
