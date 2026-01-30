var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PageDetector_bodyOption, _PageDetector_pageClass;
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { findParentNode } from '@tiptap/core';
import { PageState } from './types';
import { findParentDomRefOfType, getId } from './utils/node';
import { getBodyHeight, removeAbsentHtmlH } from './core';
import { PageComputedContext, defaultNodesComputed } from './computed';
import { Fragment, Slice } from '@tiptap/pm/model';
import { PAGE } from './node-names';
import { rafDebounce } from './utils/debounce';
import { DirtyPageTracker } from './utils/dirty-tracker';
import { perfMonitor } from './utils/performance-monitor';
let composition = false;
const dirtyTracker = new DirtyPageTracker();
class PageDetector {
    constructor(_editor, bodyOption, pageClass = '.PageContent') {
        _PageDetector_bodyOption.set(this, void 0);
        _PageDetector_pageClass.set(this, void 0);
        // Debounced update for better performance
        this.debouncedUpdate = rafDebounce((...args) => {
            const [view, prevState] = args;
            this.performUpdate(view, prevState);
        });
        __classPrivateFieldSet(this, _PageDetector_bodyOption, bodyOption, "f");
        __classPrivateFieldSet(this, _PageDetector_pageClass, pageClass, "f");
    }
    isOverflown(pageBody) {
        return pageBody.scrollHeight > getBodyHeight(__classPrivateFieldGet(this, _PageDetector_bodyOption, "f"));
    }
    update(view, prevState) {
        if (composition)
            return;
        // Use debounced update for rapid typing
        this.debouncedUpdate(view, prevState);
    }
    performUpdate(view, prevState) {
        const { selection, schema, tr } = view.state;
        if (view.state.doc.eq(prevState.doc))
            return;
        perfMonitor.startTimer('pageUpdate');
        const domAtPos = view.domAtPos.bind(view);
        // Get deleting state from plugin state instead of window
        const pluginState = paginationPluginKey.getState(view.state);
        const deleting = pluginState?.deleting ?? false;
        const pageNodeType = schema.nodes[PAGE];
        if (!pageNodeType)
            return;
        const pageDOM = findParentDomRefOfType(pageNodeType, domAtPos)(selection);
        if (!pageDOM)
            return;
        const pageBody = pageDOM.querySelector(__classPrivateFieldGet(this, _PageDetector_pageClass, "f"));
        if (pageBody) {
            const inserting = this.isOverflown(pageBody);
            // Track dirty pages for incremental updates
            if (inserting || deleting) {
                const totalPages = view.state.doc.childCount;
                dirtyTracker.markPositionDirty(selection.from, totalPages);
            }
            if (inserting) {
                const curPage = findParentNode((n) => n.type.name == PAGE)(selection);
                if (curPage) {
                    const { childCount, firstChild } = curPage.node;
                    if (childCount == 1 && firstChild?.type.name == 'table' && firstChild.childCount == 1) {
                        return;
                    }
                }
            }
            if (inserting || deleting) {
                if (inserting)
                    tr.setMeta('inserting', inserting);
                if (deleting) {
                    tr.setMeta('deleting', true);
                }
                view.dispatch(tr);
            }
        }
        perfMonitor.endTimer('pageUpdate');
    }
}
_PageDetector_bodyOption = new WeakMap(), _PageDetector_pageClass = new WeakMap();
export const paginationPluginKey = new PluginKey('pagination');
export const pagePlugin = (editor, bodyOption) => {
    const plugin = new Plugin({
        key: paginationPluginKey,
        view: () => {
            return new PageDetector(editor, bodyOption);
        },
        state: {
            init: () => {
                return new PageState(bodyOption, false, false, false);
            },
            apply: (tr, prevState) => {
                return prevState.transform(tr);
            },
        },
        /**
         * @description Based on the state set in the apply method, determine if pagination is needed and execute pagination logic
         * @method appendTransaction Add a new Transaction
         * @param newTr New Transaction
         * @param _prevState
         * @param state
         */
        appendTransaction(_, prevState, state) {
            removeAbsentHtmlH();
            const page = new PageComputedContext(editor, defaultNodesComputed, this.getState(state), state, prevState);
            const tr = page.run();
            return tr;
        },
        props: {
            handleDOMEvents: {
                compositionstart() {
                    composition = true;
                },
                compositionend() {
                    composition = false;
                },
            },
            transformPastedHTML(html) {
                return html;
            },
            transformPasted(slice) {
                slice.content.descendants((node) => {
                    // Assign unique ID to pasted content
                    if (node.attrs && typeof node.attrs === 'object') {
                        node.attrs.id = getId();
                    }
                });
                return slice;
            },
            transformCopied(slice) {
                if (slice.content.firstChild?.type.name == 'page') {
                    const nodes = [];
                    slice.content.content.forEach((node) => node.content.forEach((n) => {
                        const clonedNode = n.copy(n.content);
                        nodes.push(clonedNode);
                    }));
                    const fragment = Fragment.fromArray(nodes);
                    const newslice = new Slice(fragment, 0, fragment.size);
                    return newslice;
                }
                return slice;
            },
            handleKeyDown(view, event) {
                // Set deleting state in transaction metadata when backspace is pressed
                if (event.code == 'Backspace') {
                    const tr = view.state.tr.setMeta('deleting', true);
                    view.dispatch(tr);
                }
                return false;
            },
        },
    });
    return plugin;
};
