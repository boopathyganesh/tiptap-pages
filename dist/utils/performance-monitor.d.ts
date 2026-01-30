/**
 * Performance Monitor for tracking pagination performance
 */
export interface PerformanceMetrics {
    paginationTime: number;
    domMeasurementTime: number;
    cacheHitRate: number;
    totalPages: number;
    dirtyPages: number;
    memoryUsage?: number;
}
export declare class PerformanceMonitor {
    private metrics;
    private startTimes;
    private cacheHits;
    private cacheMisses;
    /**
     * Start timing an operation
     */
    startTimer(label: string): void;
    /**
     * End timing and record duration
     */
    endTimer(label: string): number;
    /**
     * Record a cache hit
     */
    recordCacheHit(): void;
    /**
     * Record a cache miss
     */
    recordCacheMiss(): void;
    /**
     * Get cache hit rate
     */
    getCacheHitRate(): number;
    /**
     * Get metric value
     */
    getMetric(label: string): number | undefined;
    /**
     * Get all metrics
     */
    getAllMetrics(): PerformanceMetrics;
    /**
     * Get memory usage (if available)
     */
    private getMemoryUsage;
    /**
     * Log performance summary
     */
    logSummary(): void;
    /**
     * Reset all metrics
     */
    reset(): void;
}
export declare const perfMonitor: PerformanceMonitor;
