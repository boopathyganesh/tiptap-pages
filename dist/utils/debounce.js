/**
 * Debounce utility for performance optimization
 * Delays function execution until after a wait period of inactivity
 */
export function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
/**
 * Throttle utility for rate limiting
 * Ensures function is called at most once per wait period
 */
export function throttle(func, wait) {
    let inThrottle = false;
    let lastResult;
    return function executedFunction(...args) {
        if (!inThrottle) {
            lastResult = func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, wait);
        }
        return lastResult;
    };
}
/**
 * RequestAnimationFrame-based debounce
 * Waits for next animation frame before executing
 */
export function rafDebounce(func) {
    let rafId = null;
    return function executedFunction(...args) {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
            func(...args);
            rafId = null;
        });
    };
}
