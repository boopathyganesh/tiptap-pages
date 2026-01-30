import { Extension } from '@tiptap/core';
import { type PageOptions } from './types';
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        PageExtension: {
            /**
             * Recompute pagination (recalculate all pages)
             */
            recomputeComputedHtml: () => ReturnType;
            /**
             * Set page format using preset name or custom format
             * @param format - Format name ('A4', 'Letter', etc.) or custom PageFormat object
             */
            setPageFormat: (format: string | import('./page-formats').PageFormat) => ReturnType;
            /**
             * Set page gap (spacing between pages)
             * @param gap - Gap in pixels
             */
            setPageGap: (gap: number) => ReturnType;
            /**
             * Set page break background color
             * @param color - CSS color string
             */
            setPageBreakBackground: (color: string) => ReturnType;
        };
    }
}
export declare const PageExtension: Extension<PageOptions, any>;
