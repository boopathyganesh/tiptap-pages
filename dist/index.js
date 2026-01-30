export { PageExtension } from './page-extension';
export { Document as PageDocument } from './Document';
export { Page } from './page';
export { MarginUnit, ParagraphSpacingUnit, DEFAULT_PAGE_OPTIONS } from './types';
export { UnitConversion } from './core';
export { PAGE } from './node-names';
export { getId } from './utils/node';
export { PAGE_FORMATS, pageFormatToOptions, getPageFormat, getPageFormatNames } from './page-formats';
// LRU Cache utility
export { LRUCache } from './utils/lru-cache';
// Performance utilities
export { debounce, throttle, rafDebounce } from './utils/debounce';
export { DirtyPageTracker } from './utils/dirty-tracker';
export { VirtualScrollManager, useVirtualScroll } from './utils/virtual-scroller';
export { PerformanceMonitor, perfMonitor } from './utils/performance-monitor';
