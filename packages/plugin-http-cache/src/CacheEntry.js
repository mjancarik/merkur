/**
 * The cache entry is a typed container of cache data used to track the
 * creation and expiration of cache entries.
 */
export default class CacheEntry {
  /**
   * Initializes the cache entry.
   *
   * @param {*} value The cache entry value.
   * @param {number} ttl The time to live in milliseconds.
   */
  constructor(value, ttl) {
    this._value = value;
    this._ttl = ttl;
    this._created = Date.now();
  }

  /**
   * Returns the entry value.
   *
   * @return {*} The entry value.
   */
  get value() {
    return this._value;
  }

  /**
   * Returns `true` if this entry has expired.
   *
   * @return {boolean} `true` if this entry has expired.
   */
  isExpired() {
    let now = Date.now();
    return now > this._created + this._ttl;
  }

  /**
   * Exports this cache entry into a JSON-serializable object.
   *
   * @return {{value: *, ttl: number}} This entry exported to a
   *         JSON-serializable object.
   */
  serialize() {
    return {
      value: this.value,
      ttl: this._ttl === Infinity ? 'Infinity' : this._ttl,
    };
  }
}
