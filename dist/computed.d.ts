import { type ComputedFn, type NodesComputed, type PageState, type SplitParams, type SplitInfo } from './types';
import { type Node, type Schema } from '@tiptap/pm/model';
import { type EditorState, type Transaction } from '@tiptap/pm/state';
import { type Editor } from '@tiptap/core';
export declare const sameListCalculation: ComputedFn;
export declare const sameItemCalculation: ComputedFn;
/**
 * Default height calculation methods for different node types
 */
export declare const defaultNodesComputed: NodesComputed;
/**
 * Pagination context class - manages page splitting operations
 */
export declare class SplitContext {
    #private;
    attributes: Record<string, unknown>;
    schema: Schema;
    constructor(schema: Schema, doc: Node, height: number, paragraphDefaultHeight: number);
    /**
     * Get the document
     */
    getDoc(): Node;
    /**
     * Get the pagination height
     */
    getHeight(): number;
    /**
     * Get the accumulated height
     */
    getAccumulatedHeight(): number;
    /**
     * Get the default paragraph height
     */
    getDefaultHeight(): number;
    /**
     * Check if adding height would cause overflow
     * @param height - Height to add
     * @returns Whether it would overflow
     */
    isOverflow(height: number): boolean;
    /**
     * Test overflow with additional logic for height difference optimization
     * @param height - Height to test
     * @returns Whether it would overflow with optimization
     */
    isOverflowTest(height: number): boolean;
    /**
     * Add height to accumulated total
     * @param height - Height to add
     */
    addHeight(height: number): void;
    /**
     * Set the split point boundary
     * @param pos - Split point position
     * @param depth - Split point depth
     */
    setBoundary(pos: number, depth: number): void;
    /**
     * Get the current split point boundary
     */
    pageBoundary(): SplitInfo | null;
    /**
     * Resolve the split point into chunks for processing
     * @param pos - Split point position
     * @returns Array of position chunks
     */
    splitResolve(pos: number): (number | Node)[][];
    /**
     * Get the last page node
     */
    lastPage(): Node | null;
}
/**
 * PageComputedContext - Core pagination calculation class
 *
 * Handles:
 * - Page splitting and merging
 * - Document state management
 * - Node height calculations
 * - Transaction processing
 */
export declare class PageComputedContext {
    nodesComputed: NodesComputed;
    state: EditorState;
    tr: Transaction;
    prevState: EditorState;
    pageState: PageState;
    editor: Editor;
    constructor(editor: Editor, nodesComputed: NodesComputed, pageState: PageState, state: EditorState, prevState: EditorState);
    /**
     * Core execution logic for pagination
     */
    run(): Transaction;
    /**
     * Remove elements with duplicate IDs to prevent conflicts
     */
    removeElementsWithDuplicateId(): void;
    /**
     * Compute pagination for the current document state
     */
    computed(): Transaction;
    /**
     * Initialize pagination when the document starts loading
     */
    initComputed(): Transaction;
    /**
     * Recursively split pages until no more splitting is needed
     */
    splitDocument(): void;
    /**
     * Merge pages starting from the count-th page
     * @param count - Starting page number for merging
     */
    mergeDefaultDocument(count: number): void;
    /**
     * Merge remaining documents and paginate the remaining documents
     * Depth judgment: If the first child tag of the remaining page is an extended type (split type of the main type),
     * the depth is 2 when merging. If the first tag is not an extended type, the depth is 1
     */
    mergeDocument(): void;
    /**
     * Calculate the starting number for ordered lists that span multiple pages
     * @param listNode - The list node to calculate for
     * @param splitPos - The position where the list is split
     * @returns The starting number for the new page
     */
    calculateOrderedListStart(_listNode: Node, splitPos: number): number;
    /**
     * Pagination main logic - modify the system tr split method, add default extend judgment, regenerate default id
     * @param params - Split parameters including position, depth, types after, and schema
     */
    splitPage({ pos, depth, typesAfter, schema }: SplitParams): void;
    /**
     * Check and fix paragraph line breaks caused by pagination
     */
    checkNodeAndFix(): Transaction;
    /**
     * Get the point that needs pagination and return it
     * @returns Split information if pagination is needed, null otherwise
     */
    getNodeHeight(): SplitInfo | null;
}
