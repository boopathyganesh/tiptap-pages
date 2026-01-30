/**
 * Debounce utility for performance optimization
 * Delays function execution until after a wait period of inactivity
 */
export declare function debounce<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle utility for rate limiting
 * Ensures function is called at most once per wait period
 */
export declare function throttle<T extends (...args: unknown[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * RequestAnimationFrame-based debounce
 * Waits for next animation frame before executing
 */
export declare function rafDebounce<T extends (...args: unknown[]) => void>(func: T): (...args: Parameters<T>) => void;
