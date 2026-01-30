/**
 * Performance Monitor for tracking pagination performance
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }
    /**
     * Start timing an operation
     */
    startTimer(label) {
        this.startTimes.set(label, performance.now());
    }
    /**
     * End timing and record duration
     */
    endTimer(label) {
        const startTime = this.startTimes.get(label);
        if (!startTime)
            return 0;
        const duration = performance.now() - startTime;
        this.metrics.set(label, duration);
        this.startTimes.delete(label);
        return duration;
    }
    /**
     * Record a cache hit
     */
    recordCacheHit() {
        this.cacheHits++;
    }
    /**
     * Record a cache miss
     */
    recordCacheMiss() {
        this.cacheMisses++;
    }
    /**
     * Get cache hit rate
     */
    getCacheHitRate() {
        const total = this.cacheHits + this.cacheMisses;
        return total === 0 ? 0 : (this.cacheHits / total) * 100;
    }
    /**
     * Get metric value
     */
    getMetric(label) {
        return this.metrics.get(label);
    }
    /**
     * Get all metrics
     */
    getAllMetrics() {
        return {
            paginationTime: this.metrics.get('pagination') ?? 0,
            domMeasurementTime: this.metrics.get('domMeasurement') ?? 0,
            cacheHitRate: this.getCacheHitRate(),
            totalPages: this.metrics.get('totalPages') ?? 0,
            dirtyPages: this.metrics.get('dirtyPages') ?? 0,
            memoryUsage: this.getMemoryUsage(),
        };
    }
    /**
     * Get memory usage (if available)
     */
    getMemoryUsage() {
        if ('memory' in performance && performance.memory) {
            const memory = performance.memory;
            return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        }
        return undefined;
    }
    /**
     * Log performance summary
     */
    logSummary() {
        const metrics = this.getAllMetrics();
        console.log('📊 Performance Metrics:', {
            'Pagination Time': `${metrics.paginationTime.toFixed(2)}ms`,
            'DOM Measurement': `${metrics.domMeasurementTime.toFixed(2)}ms`,
            'Cache Hit Rate': `${metrics.cacheHitRate.toFixed(1)}%`,
            'Total Pages': metrics.totalPages,
            'Dirty Pages': metrics.dirtyPages,
            'Memory Usage': metrics.memoryUsage ? `${metrics.memoryUsage}MB` : 'N/A',
        });
    }
    /**
     * Reset all metrics
     */
    reset() {
        this.metrics.clear();
        this.startTimes.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }
}
// Singleton instance
export const perfMonitor = new PerformanceMonitor();
