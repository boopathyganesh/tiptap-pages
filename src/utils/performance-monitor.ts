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

export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private startTimes: Map<string, number> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Start timing an operation
   */
  startTimer(label: string): void {
    this.startTimes.set(label, performance.now());
  }

  /**
   * End timing and record duration
   */
  endTimer(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);
    this.startTimes.delete(label);

    return duration;
  }

  /**
   * Record a cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  /**
   * Record a cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total === 0 ? 0 : (this.cacheHits / total) * 100;
  }

  /**
   * Get metric value
   */
  getMetric(label: string): number | undefined {
    return this.metrics.get(label);
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics {
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
  private getMemoryUsage(): number | undefined {
    if ('memory' in performance && performance.memory) {
      const memory = performance.memory as {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return undefined;
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
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
  reset(): void {
    this.metrics.clear();
    this.startTimes.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();
