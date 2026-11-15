/**
 * Small in-memory TTL cache with LRU eviction and request coalescing.
 * Expired entries are kept so callers can serve stale data when an upstream fails.
 */
export class TtlCache {
  constructor({ maxEntries = 500, maxBytes = Infinity } = {}) {
    this.maxEntries = maxEntries;
    this.maxBytes = maxBytes;
    this.bytes = 0;
    this.map = new Map();
    this.inflight = new Map();
  }

  peek(key) {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    this.map.delete(key);
    this.map.set(key, entry);
    return { value: entry.value, fresh: entry.expiresAt > Date.now() };
  }

  set(key, value, ttlMs, size = 0) {
    const previous = this.map.get(key);
    if (previous) {
      this.bytes -= previous.size;
      this.map.delete(key);
    }
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs, size });
    this.bytes += size;
    while (this.map.size > this.maxEntries || this.bytes > this.maxBytes) {
      const [oldestKey, oldest] = this.map.entries().next().value;
      this.map.delete(oldestKey);
      this.bytes -= oldest.size;
    }
  }

  /** Returns a fresh value, or loads it once even under concurrent calls; falls back to stale on error. */
  async getOrLoad(key, ttlMs, loader, sizeOf = () => 0) {
    const hit = this.peek(key);
    if (hit?.fresh) return hit.value;
    if (this.inflight.has(key)) return this.inflight.get(key);

    const promise = (async () => {
      try {
        const value = await loader();
        this.set(key, value, ttlMs, sizeOf(value));
        return value;
      } catch (err) {
        if (hit) return hit.value;
        throw err;
      } finally {
        this.inflight.delete(key);
      }
    })();
    this.inflight.set(key, promise);
    return promise;
  }
}
