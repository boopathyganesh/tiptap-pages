/**
 * Dirty Page Tracker for Incremental Pagination
 * Tracks which pages need re-calculation to avoid full document traversal
 */

export class DirtyPageTracker {
  private dirtyPages: Set<number> = new Set();
  private lastChangePos: number | null = null;
  private isFullRecalcNeeded = false;

  /**
   * Mark a page as dirty (needs re-calculation)
   */
  markDirty(pageIndex: number): void {
    this.dirtyPages.add(pageIndex);
  }

  /**
   * Mark a range of pages as dirty
   */
  markRangeDirty(startPage: number, endPage: number): void {
    for (let i = startPage; i <= endPage; i++) {
      this.dirtyPages.add(i);
    }
  }

  /**
   * Mark position-based dirty pages
   * Marks current page and next 2 pages (content might overflow)
   */
  markPositionDirty(pos: number, totalPages: number): void {
    // Estimate which page this position is on (assuming ~1123px per page)
    const estimatedPage = Math.floor(pos / 1000); // Rough estimate
    
    // Mark current page and next 2 pages as dirty
    const startPage = Math.max(0, estimatedPage);
    const endPage = Math.min(totalPages - 1, estimatedPage + 2);
    
    this.markRangeDirty(startPage, endPage);
    this.lastChangePos = pos;
  }

  /**
   * Check if a page is dirty
   */
  isDirty(pageIndex: number): boolean {
    return this.isFullRecalcNeeded || this.dirtyPages.has(pageIndex);
  }

  /**
   * Get all dirty page indices
   */
  getDirtyPages(): number[] {
    return Array.from(this.dirtyPages).sort((a, b) => a - b);
  }

  /**
   * Clear dirty tracking
   */
  clear(): void {
    this.dirtyPages.clear();
    this.lastChangePos = null;
    this.isFullRecalcNeeded = false;
  }

  /**
   * Check if any pages are dirty
   */
  hasDirtyPages(): boolean {
    return this.dirtyPages.size > 0 || this.isFullRecalcNeeded;
  }

  /**
   * Mark all pages for full recalculation
   */
  markFullRecalc(): void {
    this.isFullRecalcNeeded = true;
  }

  /**
   * Check if full recalculation is needed
   */
  needsFullRecalc(): boolean {
    return this.isFullRecalcNeeded;
  }

  /**
   * Get count of dirty pages
   */
  getDirtyCount(): number {
    return this.isFullRecalcNeeded ? Infinity : this.dirtyPages.size;
  }
}
