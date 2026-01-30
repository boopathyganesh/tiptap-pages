/**
 * Simple LRU (Least Recently Used) Cache implementation
 * Prevents unbounded memory growth by limiting cache size
 */
export class LRUCache {
    constructor(maxSize = 100) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    /**
     * Get value from cache
     * Moves item to end (marks as recently used)
     */
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Move to end (mark as recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }
    /**
     * Set value in cache
     * Evicts oldest item if cache is full
     */
    set(key, value) {
        // If key exists, delete it first to update position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Add new item
        this.cache.set(key, value);
        // Evict oldest item if cache is full
        if (this.cache.size > this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
    }
    /**
     * Check if key exists in cache
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Clear entire cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Get current cache size
     */
    size() {
        return this.cache.size;
    }
}
