/**
 * Simple LRU (Least Recently Used) Cache implementation
 * Prevents unbounded memory growth by limiting cache size
 */
export declare class LRUCache<K, V> {
    private cache;
    private maxSize;
    constructor(maxSize?: number);
    /**
     * Get value from cache
     * Moves item to end (marks as recently used)
     */
    get(key: K): V | undefined;
    /**
     * Set value in cache
     * Evicts oldest item if cache is full
     */
    set(key: K, value: V): void;
    /**
     * Check if key exists in cache
     */
    has(key: K): boolean;
    /**
     * Clear entire cache
     */
    clear(): void;
    /**
     * Get current cache size
     */
    size(): number;
}
