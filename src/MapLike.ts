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
  private _map: { [key: string]: V | null | undefined };

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
  keys(): Array<string> {
    return Object.keys(this._map)
      .filter((key) => this.has(key));
  }

  /**
   * Get the values of the map
   * @return {any[]}
   */
  values(): (V | null | undefined)[] {
    return this.keys()
      .map((key) => this._map[key]);
  }

  /**
   * Get the value by key
   * @param key
   * @return {any}
   */
  get(key: string): V | null | undefined {
    return this._map[key];
  }

  /**
   * Check if the key exists
   * @param key
   * @return {boolean}
   */
  has(key: string): boolean {
    return this._map[key] !== null && this._map[key] !== undefined;
  }

  /**
   * Set the value for the key
   * @param key
   * @param value
   */
  set(key: string, value: V): MapLike<K,V> {
    this._map[key] = value;
    return this;
  }

  /**
   * Delete the entry by key
   * @param key
   */
  delete(key: string): boolean {
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
