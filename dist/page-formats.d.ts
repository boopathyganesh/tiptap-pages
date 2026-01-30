/**
 * Page format presets following TipTap Pro official patterns
 * All dimensions are in pixels at 96 DPI
 */
import { type PageOptions } from './types';
export interface PageFormat {
    name: string;
    width: number;
    height: number;
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
/**
 * Standard page format presets
 * Following TipTap Pro official format options
 */
export declare const PAGE_FORMATS: Record<string, PageFormat>;
/**
 * Convert PageFormat to PageOptions
 */
export declare function pageFormatToOptions(format: PageFormat | string): Partial<PageOptions>;
/**
 * Get page format by name
 */
export declare function getPageFormat(name: string): PageFormat | undefined;
/**
 * Get all available page format names
 */
export declare function getPageFormatNames(): string[];
