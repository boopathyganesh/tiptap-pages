import { type NodeType, type ResolvedPos, type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type EditorView } from '@tiptap/pm/view';
import { type Selection } from '@tiptap/pm/state';
export declare function getId(): string;
export declare const findParentDomRefOfType: (nodeType: NodeType, domAtPos: EditorView["domAtPos"]) => (selection: Selection) => Node | null | undefined;
export declare const equalNodeType: (nodeType: NodeType, node: ProseMirrorNode) => boolean;
export declare const findParentDomRef: (predicate: {
    (node: ProseMirrorNode): boolean;
    (node: ProseMirrorNode): boolean;
}, domAtPos: EditorView["domAtPos"]) => (selection: Selection) => Node | null | undefined;
export declare const findDomRefAtPos: (position: number, domAtPos: EditorView["domAtPos"]) => Node | null;
export declare const findParentNode: (predicate: (node: ProseMirrorNode) => boolean) => ({ $from }: Selection) => {
    pos: number;
    start: number;
    depth: number;
    node: ProseMirrorNode;
} | undefined;
export declare const findParentNodeClosestToPos: ($pos: ResolvedPos, predicate: (node: ProseMirrorNode) => boolean) => {
    pos: number;
    start: number;
    depth: number;
    node: ProseMirrorNode;
} | undefined;
export declare const findChildrenWithPredicate: (predicate: (node: ProseMirrorNode) => boolean) => (node: ProseMirrorNode) => ProseMirrorNode[];
export declare const idAttributes: {
    id: {
        default: null;
    };
    extend: {
        default: boolean;
    };
};
