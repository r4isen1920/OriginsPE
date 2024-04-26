
declare global {
  interface Math {
    /**
     * Linearly interpolates between two values.
     * 
     * @param a - The start value.
     * @param b - The end value.
     * @param t - The interpolation value.
     * @returns The interpolated value.
     */
    lerp(a: number, b: number, t: number): number;

    /**
     * Clamps a value between a minimum and maximum.
     * 
     * @param value - The value to clamp.
     * @param min - The minimum value.
     * @param max - The maximum value.
     * @returns The clamped value.
     */
    clamp(value: number, min: number, max: number): number;
  }
}

Math.lerp = function(a: number, b: number, t: number): number {
  return a + t * (b - a);
};

Math.clamp = function(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
};

export {};
