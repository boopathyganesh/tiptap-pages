import { Node, type Schema } from '@tiptap/pm/model';
import { type JSONContent } from '@tiptap/core';
import { type SplitContext } from './computed';
import { type PageOptions } from './types';
export declare const getBodyHeight: (options: PageOptions) => number;
export declare const getBodyWidth: (options: PageOptions) => number;
export declare function getHTMLFromFragment(doc: Node, schema: Schema, options?: {
    document?: Document;
}): string;
export declare function getFlag(cnode: Node, schema: Schema): boolean | null;
export declare function generateHTML(doc: JSONContent, schema: Schema): string;
export declare function getBreakPos(cnode: Node, dom: HTMLElement, splitContext: SplitContext): number | null;
export declare function getJsonFromDoc(node: Node): JSONContent;
export declare function getJsonFromDocForJson(json: JSONContent): JSONContent;
export declare function getBlockHeight(node: Node): number;
export declare class UnitConversion {
    private arrDPI;
    constructor();
    pxConversionMm(value: number): number;
    mmConversionPx(value: number): number;
    ptConversionPx(value: number): number;
    pxConversionPt(value: number): number;
}
export declare function computedHeight(html: string, id: string): number;
export declare function computedWidth(html: string, cache?: boolean): {
    height: number;
    width: number;
};
export declare function getContentSpacing(dom: HTMLElement): number;
/**
 * Get spacing for a DOM element
 * @param dom - The DOM element to measure
 * @returns Total spacing in pixels
 */
export declare function getSpacing(dom: HTMLElement): number;
/**
 * Get default height from cache or calculate it
 * @returns Default height in pixels
 */
export declare function getDefault(): number;
/**
 * Get padding, margin, and border for a DOM element
 * @param dom - The DOM element to measure
 * @returns Total spacing including borders in pixels
 */
export declare function getDomPaddingAndMargin(dom: HTMLElement): number;
/**
 * Get the total height of a DOM element including margins and padding
 * @param dom - The DOM element to measure
 * @returns Total height in pixels
 */
export declare function getDomHeight(dom: HTMLElement): number;
export declare function getAbsentHtmlH(node: Node, schema: Schema): HTMLElement | null;
export declare function removeAbsentHtmlH(): void;
export declare function removeComputedHtml(): void;
export declare function buildComputedHtml(options: PageOptions): void;
