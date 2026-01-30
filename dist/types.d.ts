import { type Attrs, type NodeType, type Schema, type Node } from '@tiptap/pm/model';
import { type Transaction } from '@tiptap/pm/state';
import { type SplitContext } from './computed';
export declare const ParagraphSpacingUnit: {
    readonly Pts: "PTS";
};
export declare const MarginUnit: {
    readonly Cm: "CM";
    readonly Inches: "INCHES";
};
export type ComputedFn = (splitContext: SplitContext, node: Node, pos: number, parent: Node | null, dom: HTMLElement) => boolean;
export type NodesComputed = Record<string, ComputedFn>;
export type PageNumberPosition = 'top' | 'bottom';
export type PageNumberAlignment = 'left' | 'center' | 'right';
export interface MarginConfig {
    unit: typeof MarginUnit[keyof typeof MarginUnit];
    value: number;
}
export interface PageMargins {
    top: MarginConfig;
    bottom: MarginConfig;
    left: MarginConfig;
    right: MarginConfig;
}
export interface PageNumberConfig {
    show: boolean;
    showCount: boolean;
    showOnFirstPage: boolean;
    position: PageNumberPosition | null;
    alignment: PageNumberAlignment | null;
}
export interface ParagraphSpacingConfig {
    before: {
        unit: typeof ParagraphSpacingUnit[keyof typeof ParagraphSpacingUnit];
        value: number;
    };
    after: {
        unit: typeof ParagraphSpacingUnit[keyof typeof ParagraphSpacingUnit];
        value: number;
    };
}
export interface PageLayoutConfig {
    margins?: PageMargins;
    paragraphSpacing?: ParagraphSpacingConfig;
}
export interface PageOptions {
    bodyHeight: number;
    bodyWidth: number;
    bodyPadding?: number;
    headerHeight?: number;
    footerHeight?: number;
    pageLayout?: PageLayoutConfig;
    pageNumber?: PageNumberConfig;
    types?: never[];
    headerData?: unknown[];
    footerData?: unknown[];
    /**
     * Performance optimization settings
     */
    performance?: {
        /** Enable virtual scrolling for large documents (default: true for 50+ pages) */
        virtualScrolling?: boolean;
        /** Enable debouncing for rapid edits (default: true) */
        debounceEdits?: boolean;
        /** Enable performance monitoring (default: false) */
        enableMonitoring?: boolean;
        /** Debounce delay in ms (default: 16ms = 1 frame) */
        debounceDelay?: number;
    };
}
export declare const DEFAULT_PAGE_OPTIONS: Partial<PageOptions>;
export type SplitParams = {
    pos: number;
    depth?: number;
    typesAfter?: ({
        type: NodeType;
        attrs?: Attrs | null;
    } | null)[];
    schema: Schema<string, string>;
    force?: boolean;
};
export declare class PageState {
    bodyOptions: PageOptions;
    deleting: boolean;
    inserting: boolean;
    splitPage: boolean;
    constructor(bodyOptions: PageOptions, deleting: boolean, inserting: boolean, splitPage: boolean);
    transform(tr: Transaction): PageState;
}
export type SplitInfo = {
    pos: number;
    depth: number;
    attributes?: Record<string, unknown>;
};
