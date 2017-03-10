/**
 * MapLike
 *
 * This class is for mocking the ES2015 Map object, so its easy to replace in the future.
 * Note that this is non-iterable, and has no constructor arguments.
 *
 * Maybe we can encourage our users to use a Map polyfill,
 * but we don't want to do that at this point.
 */
export default class MapLike<K,V> {
  /**
   * The actual map
   */
  private _map;

  /**
   * Number of entries in this map
   * @return {number}
   */
  get size(): number {
    return this.keys().length;
  }

  constructor() {
    // Create an object without prototype
    this._map = Object.create(null);
  }

  /**
   * Get the keys of the map
   * @return {string[]}
   */
  keys(): string[] {
    return Object.keys(this._map);
  }

  /**
   * Get the values of the map
   * @return {any[]}
   */
  values(): V[] {
    return this.keys().map((key) => this._map[key]);
  }

  /**
   * Get the value by key
   * @param key
   * @return {any}
   */
  get(key: K): V {
    return this._map[key];
  }

  /**
   * Check if the key exists
   * @param key
   * @return {boolean}
   */
  has(key: K): boolean {
    return this._map[key] !== null || this._map[key] !== undefined;
  }

  /**
   * Set the value for the key
   * @param key
   * @param value
   */
  set(key: K, value: V): MapLike<K,V> {
    this._map[key] = value;
    return this;
  }

  /**
   * Delete the entry by key
   * @param key
   */
  delete(key: K): boolean {
    if (!this.has(key)) {
      return false;
    }

    this._map[key] = null;
    return true;
  }

  /**
   * Clear the map
   * @return {MapLike}
   */
  clear(): MapLike<K,V> {
    this._map = Object.create(null);
    return this;
  }
}
