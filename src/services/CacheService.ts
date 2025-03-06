type CacheEntry<T> = {
  data: T;
  timestamp: number;
  key: string;
};

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL = 300000; // 5 minutes in milliseconds

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key,
    });

    // Set expiration
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > this.defaultTTL) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  // Get all keys that match a pattern
  getKeysByPattern(pattern: string): string[] {
    const regex = new RegExp(pattern);
    return Array.from(this.cache.keys()).filter(key => regex.test(key));
  }

  // Delete all keys that match a pattern
  deleteByPattern(pattern: string): void {
    const keys = this.getKeysByPattern(pattern);
    keys.forEach(key => this.delete(key));
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Get cache statistics
  getStats(): {
    size: number;
    oldestEntry: number;
    newestEntry: number;
    averageAge: number;
  } {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) {
      return {
        size: 0,
        oldestEntry: 0,
        newestEntry: 0,
        averageAge: 0,
      };
    }

    const now = Date.now();
    const ages = entries.map(entry => now - entry.timestamp);

    return {
      size: this.cache.size,
      oldestEntry: Math.max(...ages),
      newestEntry: Math.min(...ages),
      averageAge: ages.reduce((a, b) => a + b, 0) / ages.length,
    };
  }

  // Bulk operations
  bulkSet<T>(entries: { key: string; data: T; ttl?: number }[]): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl);
    });
  }

  bulkGet<T>(keys: string[]): (T | null)[] {
    return keys.map(key => this.get<T>(key));
  }

  bulkDelete(keys: string[]): void {
    keys.forEach(key => this.delete(key));
  }

  // Cache maintenance
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > this.defaultTTL) {
        this.delete(key);
      }
    });
  }

  // Start automatic cleanup
  startCleanupInterval(interval = 60000): NodeJS.Timer {
    return setInterval(() => {
      this.cleanup();
    }, interval);
  }

  // Cache warming
  async warmup<T>(
    key: string,
    fetchData: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached) return cached;

    const data = await fetchData();
    this.set(key, data, ttl);
    return data;
  }

  // Batch cache warming
  async warmupBatch<T>(
    keys: string[],
    fetchBatch: (keys: string[]) => Promise<Map<string, T>>,
    ttl?: number
  ): Promise<Map<string, T>> {
    const missingKeys = keys.filter(key => !this.has(key));
    if (missingKeys.length === 0) {
      return new Map(keys.map(key => [key, this.get<T>(key)!]));
    }

    const fetchedData = await fetchBatch(missingKeys);
    const entries = Array.from(fetchedData.entries());
    entries.forEach(([key, data]) => {
      this.set(key, data, ttl);
    });

    return new Map(keys.map(key => [key, this.get<T>(key)!]));
  }
} 