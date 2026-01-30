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
export declare class VirtualScrollManager {
    private config;
    private visibleRange;
    private totalPages;
    private scrollContainer;
    constructor(config: VirtualScrollConfig);
    /**
     * Initialize virtual scrolling on a container
     */
    init(container: HTMLElement, totalPages: number): void;
    /**
     * Update which pages should be rendered based on scroll position
     */
    updateVisibleRange(): void;
    /**
     * Check if a page should be rendered
     */
    shouldRenderPage(pageIndex: number): boolean;
    /**
     * Get visible page range
     */
    getVisibleRange(): {
        start: number;
        end: number;
    };
    /**
     * Get total virtual height (for scroll container)
     */
    getTotalHeight(): number;
    /**
     * Get offset for a specific page
     */
    getPageOffset(pageIndex: number): number;
    /**
     * Update total page count
     */
    setTotalPages(count: number): void;
    /**
     * Create a throttled scroll handler
     */
    createScrollHandler(callback: () => void): () => void;
    /**
     * Destroy and cleanup
     */
    destroy(): void;
}
/**
 * React-style hook pattern for virtual scrolling
 */
export declare function useVirtualScroll(totalPages: number, pageHeight: number, overscanCount?: number): {
    shouldRenderPage: (index: number) => boolean;
    getPageOffset: (index: number) => number;
    getTotalHeight: () => number;
    updateOnScroll: () => void;
};
