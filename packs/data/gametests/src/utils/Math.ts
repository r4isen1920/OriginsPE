declare global {
	interface Math {
		/**
		 * Clamps the value of n between min and max
		 * @param n
		 * @param min
		 * @param max
		 */
		clamp(n: number, min: number, max: number): number;
		/**
		 * Linearly interpolates between a and b by t
		 * @param a
		 * @param b
		 * @param t
		 */
		lerp(a: number, b: number, t: number): number;
		/**
		 * Returns true if n is between min and max
		 * @param n
		 * @param min
		 * @param max
		 */
		isInRange(n: number, min: number, max: number): boolean;
		/**
		 * Returns a random number between a and b
		 * @param a
		 * @param b
		 */
		withinRange(a: number, b: number): number;
		/**
		 * Returns a random floored number between a and b
		 * @param a
		 * @param b
		 */
		integerWithinRange(a: number, b: number): number;
		/**
		 * Returns a random element from an array
		 * @param arr
		 */
		chooseFromArray<T>(arr: T[]): T;
	}
}

Math.clamp = function (n, min, max) {
	return Math.min(Math.max(n, min), max);
};

Math.lerp = function (a, b, t) {
	return a + (b - a) * t;
};

Math.isInRange = function (n, min, max) {
	return n >= min && n <= max;
};

Math.withinRange = function (a: number, b: number) {
	let d = b - a;
	return a + Math.random() * d;
};

Math.integerWithinRange = function (a: number, b: number) {
	return Math.round(Math.withinRange(a, b));
};

Math.chooseFromArray = function <T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
};

export {};
