/**
 * Dirty Page Tracker for Incremental Pagination
 * Tracks which pages need re-calculation to avoid full document traversal
 */
export declare class DirtyPageTracker {
    private dirtyPages;
    private lastChangePos;
    private isFullRecalcNeeded;
    /**
     * Mark a page as dirty (needs re-calculation)
     */
    markDirty(pageIndex: number): void;
    /**
     * Mark a range of pages as dirty
     */
    markRangeDirty(startPage: number, endPage: number): void;
    /**
     * Mark position-based dirty pages
     * Marks current page and next 2 pages (content might overflow)
     */
    markPositionDirty(pos: number, totalPages: number): void;
    /**
     * Check if a page is dirty
     */
    isDirty(pageIndex: number): boolean;
    /**
     * Get all dirty page indices
     */
    getDirtyPages(): number[];
    /**
     * Clear dirty tracking
     */
    clear(): void;
    /**
     * Check if any pages are dirty
     */
    hasDirtyPages(): boolean;
    /**
     * Mark all pages for full recalculation
     */
    markFullRecalc(): void;
    /**
     * Check if full recalculation is needed
     */
    needsFullRecalc(): boolean;
    /**
     * Get count of dirty pages
     */
    getDirtyCount(): number;
}
