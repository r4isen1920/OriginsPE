
/**
 * 
 * Additional Math stuff
 */
export class MathR4 {
  /**
   * 
   * Linearly interpolates between two values.
   * 
   * @param {number} a - The start value.
   * @param {number} b - The end value.
   * @param {number} t - The interpolation value.
   * @returns {number} The interpolated value.
   */
  static lerp(a, b, t) {
    return a + t * (b - a);
  }

  /**
   * 
   * Clamps a value between a minimum and maximum.
   * 
   * @param {number} value - The value to clamp.
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value.
   * @returns {number} The clamped value.
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}
