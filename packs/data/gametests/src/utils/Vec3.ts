/**
 *
 * @author
 * JaylyDev
 *
 * @remarks
 * Wrapper class of Vector3
 */

interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export class Vector3 implements Vector3Like {
  x: number;
  y: number;
  z: number;

  /**
   * @remarks
   * Creates a new instance of a vector.
   * @param x
   * X coordinate.
   * @param y
   * Y coordinate.
   * @param z
   * Z coordinate.
   */
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * @remarks
   * Returns the length of this vector.
   */
  length(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  /**
   * @remarks
   * Returns the squared length of this vector.
   */
  lengthSquared(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }

  /**
   * @remarks
   * Returns this vector as a normalized vector.
   */
  normalized(): Vector3 {
    const magnitude = this.length();
    const DirectionX = this.x / magnitude;
    const DirectionY = this.y / magnitude;
    const DirectionZ = this.z / magnitude;
    return new Vector3(DirectionX, DirectionY, DirectionZ);
  }

  /**
   * @remarks
   * Returns the addition of these vectors.
   */
  static add(a: Vector3Like, b: Vector3Like): Vector3 {
    const vector = new Vector3(a.x, a.y, a.z);
    vector.x += b.x;
    vector.y += b.y;
    vector.z += b.z;
    return vector;
  }

  /**
   * @remarks
   * Returns the cross product of these two vectors.
   */
  static cross(a: Vector3Like, b: Vector3Like): Vector3 {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  /**
   * @remarks
   * Returns the distance between two vectors.
   */
  static distance(a: Vector3Like, b: Vector3Like): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    const distance = Math.ceil(Math.hypot(dx, dy, dz));
    return distance;
  }

  /**
   * @remarks
   * Returns the component-wise division of these vectors.
   */
  static divide(a: Vector3Like, b: Vector3Like | number): Vector3 {
    const vector = new Vector3(a.x, a.y, a.z);
    if (typeof b === "number") {
      vector.x /= b;
      vector.y /= b;
      vector.z /= b;
    } else {
      vector.x /= b.x;
      vector.y /= b.y;
      vector.z /= b.z;
    }
    return vector;
  }

  /**
   * @remarks
   * Returns the linear interpolation between a and b using t as
   * the control.
   */
  static lerp(a: Vector3Like, b: Vector3Like, t: number): Vector3 {
    const dest = new Vector3(a.x, a.y, a.z);
    dest.x += (b.x - a.x) * t;
    dest.y += (b.y - a.y) * t;
    dest.z += (b.z - a.z) * t;
    return dest;
  }

  /**
   * @remarks
   * Returns a vector that is made from the largest components of
   * two vectors.
   */
  static max(a: Vector3Like, b: Vector3Like): Vector3 {
    const vectors = [a, b];
    const arr = vectors.map(({ x, y, z }) => new Vector3(x, y, z).length());
    const max = Math.max(...arr);
    const index = arr.indexOf(max);
    const vector3 = vectors[index];
    return new Vector3(vector3.x, vector3.y, vector3.z);
  }

  /**
   * @remarks
   * Returns a vector that is made from the smallest components
   * of two vectors.
   */
  static min(a: Vector3Like, b: Vector3Like): Vector3 {
    const vectors = [a, b];
    const arr = vectors.map(({ x, y, z }) => new Vector3(x, y, z).length());
    const min = Math.min(...arr);
    const index = arr.indexOf(min);
    const vector3 = vectors[index];
    return new Vector3(vector3.x, vector3.y, vector3.z);
  }

  /**
   * @remarks
   * Returns the component-wise product of these vectors.
   */
  static multiply(a: Vector3Like, b: Vector3Like | number): Vector3 {
    const vector = new Vector3(a.x, a.y, a.z);
    if (typeof b === "number") {
      vector.x *= b;
      vector.y *= b;
      vector.z *= b;
    } else {
      vector.x *= b.x;
      vector.y *= b.y;
      vector.z *= b.z;
    }
    return vector;
  }

  /**
   * @remarks
   * Returns the spherical linear interpolation between a and b
   * using s as the control.
   */
  static slerp(a: Vector3Like, b: Vector3Like, s: number): Vector3 {
    function MathDot(a: number[], b: number[]): number {
      return a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
    }
    const θ = Math.acos(MathDot([a.x, a.y, a.z], [b.x, b.y, b.z]));
    const factor1 = Math.sin(θ * (1 - s)) / Math.sin(θ);
    const factor2 = Math.sin(θ * s) / Math.sin(θ);
    return new Vector3(
      a.x * factor1 + b.x * factor2,
      a.y * factor1 + b.y * factor2,
      a.z * factor1 + b.z * factor2
    );
  }

  /**
   * @remarks
   * Returns the subtraction of these vectors.
   */
  static subtract(a: Vector3Like, b: Vector3Like): Vector3 {
    const vector = new Vector3(a.x, a.y, a.z);
    vector.x -= b.x;
    vector.y -= b.y;
    vector.z -= b.z;
    return vector;
  }

  /**
   * Returns a Vector3 with its coordinate floored
   */
  floor(): Vector3 {
    return new Vector3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
  }

  /**
   * @remarks
   * Returns a Vector3 for a block above this Vector3
   * (that is, y + 1).
   */
  above(): Vector3 {
    return new Vector3(this.x, this.y + 1, this.z);
  }

  /**
   * @remarks
   * Returns an array of Vector3 representing all coordinates
   * in the volume (cuboid) between this location and another
   * location.
   * @param other
   * Additional Vector3 used to determine the set of
   * locations in between this location and another point.
   * @returns
   * Array of Vector3 representing the volume between
   * this location and another, inclusive of the start and end
   * points.
   */
  between(other: Vector3Like): Vector3[] {
    const distanceX = other.x - this.x;
    const distanceY = other.y - this.y;
    const distanceZ = other.z - this.z;
    const Vector3s: Vector3[] = [];
    for (let x = 0; x <= distanceX; x++) {
      const coordX = x + this.x;
      for (let y = 0; y <= distanceY; y++) {
        const coordY = y + this.y;
        for (let z = 0; z <= distanceZ; z++) {
          const coordZ = z + this.z;
          Vector3s.push(new Vector3(coordX, coordY, coordZ));
        }
      }
    }
    return Vector3s;
  }

  /**
   * @remarks
   * Compares this Vector3 and another Vector3 to one
   * another.
   * @param other
   * Other Vector3 to compare this Vector3 to.
   * @returns
   * True if the two Vector3 are equal.
   */
  equals(other: Vector3Like): boolean {
    if (this.x === other.x && this.y === other.y && this.z === other.z)
      return true;
    else return false;
  }

  /**
   * @remarks
   * Returns a Vector3 using a position relative to this
   * Vector3
   * @param x
   * X offset relative to this Vector3.
   * @param y
   * Y offset relative to this Vector3.
   * @param z
   * Z offset relative to this Vector3.
   * @returns
   * Vector3 that is positioned relative to this
   * Vector3.
   */
  offset(x: number, y: number, z: number): Vector3 {
    return new Vector3(x + this.x, y + this.y, z + this.z);
  }

  /**
   * @remarks
   * Determines whether or not two Locations are considered to be
   * near each other.
   * @param other
   * Other Vector3 to compare this Vector3 to.
   * @param epsilon
   * Maximum distance that the Locations can be from each other
   * to be considered nearby.
   * @returns
   * True if the two Locations are within epsilon distance of
   * each other.
   */
  isNear(other: Vector3Like, epsilon: number): boolean {
    return Vector3.distance(this, other) <= epsilon;
  }
}
