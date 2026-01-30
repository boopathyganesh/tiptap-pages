/**
 * Virtual Scrolling Manager for Large Documents
 * Only renders pages visible in viewport + buffer
 */
export class VirtualScrollManager {
    constructor(config) {
        this.visibleRange = { start: 0, end: 0 };
        this.totalPages = 0;
        this.scrollContainer = null;
        this.config = {
            overscanCount: config.overscanCount ?? 2,
            pageHeight: config.pageHeight,
            scrollThrottle: config.scrollThrottle ?? 100,
        };
    }
    /**
     * Initialize virtual scrolling on a container
     */
    init(container, totalPages) {
        this.scrollContainer = container;
        this.totalPages = totalPages;
        this.updateVisibleRange();
    }
    /**
     * Update which pages should be rendered based on scroll position
     */
    updateVisibleRange() {
        if (!this.scrollContainer)
            return;
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
    shouldRenderPage(pageIndex) {
        // For small documents, render all pages
        if (this.totalPages <= 10) {
            return true;
        }
        return pageIndex >= this.visibleRange.start && pageIndex <= this.visibleRange.end;
    }
    /**
     * Get visible page range
     */
    getVisibleRange() {
        return { ...this.visibleRange };
    }
    /**
     * Get total virtual height (for scroll container)
     */
    getTotalHeight() {
        return this.totalPages * this.config.pageHeight;
    }
    /**
     * Get offset for a specific page
     */
    getPageOffset(pageIndex) {
        return pageIndex * this.config.pageHeight;
    }
    /**
     * Update total page count
     */
    setTotalPages(count) {
        this.totalPages = count;
    }
    /**
     * Create a throttled scroll handler
     */
    createScrollHandler(callback) {
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
    destroy() {
        this.scrollContainer = null;
        this.visibleRange = { start: 0, end: 0 };
    }
}
/**
 * React-style hook pattern for virtual scrolling
 */
export function useVirtualScroll(totalPages, pageHeight, overscanCount = 2) {
    const manager = new VirtualScrollManager({
        pageHeight,
        overscanCount,
    });
    // Initialize with current state
    manager.setTotalPages(totalPages);
    return {
        shouldRenderPage: (index) => manager.shouldRenderPage(index),
        getPageOffset: (index) => manager.getPageOffset(index),
        getTotalHeight: () => manager.getTotalHeight(),
        updateOnScroll: () => manager.updateVisibleRange(),
    };
}
