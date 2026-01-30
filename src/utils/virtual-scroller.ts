/**
 * Virtual Scrolling Manager for Large Documents
 * Only renders pages visible in viewport + buffer
 */

export interface VirtualScrollConfig {
  /** Number of pages to render above/below viewport */
  overscanCount?: number;
  /** Page height in pixels */
  pageHeight: number;
  /** Throttle delay for scroll events (ms) */
  scrollThrottle?: number;
}

export class VirtualScrollManager {
  private config: Required<VirtualScrollConfig>;
  private visibleRange: { start: number; end: number } = { start: 0, end: 0 };
  private totalPages = 0;
  private scrollContainer: HTMLElement | null = null;

  constructor(config: VirtualScrollConfig) {
    this.config = {
      overscanCount: config.overscanCount ?? 2,
      pageHeight: config.pageHeight,
      scrollThrottle: config.scrollThrottle ?? 100,
    };
  }

  /**
   * Initialize virtual scrolling on a container
   */
  init(container: HTMLElement, totalPages: number): void {
    this.scrollContainer = container;
    this.totalPages = totalPages;
    this.updateVisibleRange();
  }

  /**
   * Update which pages should be rendered based on scroll position
   */
  updateVisibleRange(): void {
    if (!this.scrollContainer) return;

    const scrollTop = this.scrollContainer.scrollTop;
    const viewportHeight = this.scrollContainer.clientHeight;

    // Calculate visible page range
    const startPage = Math.floor(scrollTop / this.config.pageHeight);
    const endPage = Math.ceil((scrollTop + viewportHeight) / this.config.pageHeight);

    // Add overscan buffer
    const bufferedStart = Math.max(0, startPage - this.config.overscanCount);
    const bufferedEnd = Math.min(this.totalPages - 1, endPage + this.config.overscanCount);

    this.visibleRange = {
      start: bufferedStart,
      end: bufferedEnd,
    };
  }

  /**
   * Check if a page should be rendered
   */
  shouldRenderPage(pageIndex: number): boolean {
    // For small documents, render all pages
    if (this.totalPages <= 10) {
      return true;
    }

    return pageIndex >= this.visibleRange.start && pageIndex <= this.visibleRange.end;
  }

  /**
   * Get visible page range
   */
  getVisibleRange(): { start: number; end: number } {
    return { ...this.visibleRange };
  }

  /**
   * Get total virtual height (for scroll container)
   */
  getTotalHeight(): number {
    return this.totalPages * this.config.pageHeight;
  }

  /**
   * Get offset for a specific page
   */
  getPageOffset(pageIndex: number): number {
    return pageIndex * this.config.pageHeight;
  }

  /**
   * Update total page count
   */
  setTotalPages(count: number): void {
    this.totalPages = count;
  }

  /**
   * Create a throttled scroll handler
   */
  createScrollHandler(callback: () => void): () => void {
    let ticking = false;

    return () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateVisibleRange();
          callback();
          ticking = false;
        });
        ticking = true;
      }
    };
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.scrollContainer = null;
    this.visibleRange = { start: 0, end: 0 };
  }
}

/**
 * React-style hook pattern for virtual scrolling
 */
export function useVirtualScroll(
  totalPages: number,
  pageHeight: number,
  overscanCount = 2
): {
  shouldRenderPage: (index: number) => boolean;
  getPageOffset: (index: number) => number;
  getTotalHeight: () => number;
  updateOnScroll: () => void;
} {
  const manager = new VirtualScrollManager({
    pageHeight,
    overscanCount,
  });

  // Initialize with current state
  manager.setTotalPages(totalPages);

  return {
    shouldRenderPage: (index: number) => manager.shouldRenderPage(index),
    getPageOffset: (index: number) => manager.getPageOffset(index),
    getTotalHeight: () => manager.getTotalHeight(),
    updateOnScroll: () => manager.updateVisibleRange(),
  };
}
