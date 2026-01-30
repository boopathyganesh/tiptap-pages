import { type EditorState, Plugin, PluginKey } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';
import { type Editor } from '@tiptap/core';
import { findParentNode } from '@tiptap/core';
import { type PageOptions, PageState } from './types';
import { findParentDomRefOfType, getId } from './utils/node';

import { getBodyHeight, removeAbsentHtmlH } from './core';
import { PageComputedContext, defaultNodesComputed } from './computed';
import { Fragment, type Node, Slice } from '@tiptap/pm/model';
import { PAGE } from './node-names';
import { rafDebounce } from './utils/debounce';
import { DirtyPageTracker } from './utils/dirty-tracker';
import { perfMonitor } from './utils/performance-monitor';

let composition = false;
const dirtyTracker = new DirtyPageTracker();
class PageDetector {
  #bodyOption: PageOptions;
  #pageClass: string;
  constructor(_editor: Editor, bodyOption: PageOptions, pageClass = '.PageContent') {
    this.#bodyOption = bodyOption;
    this.#pageClass = pageClass;
  }


  isOverflown(pageBody: Element) {
    return pageBody.scrollHeight > getBodyHeight(this.#bodyOption);
  }
  // Debounced update for better performance
  private debouncedUpdate = rafDebounce((...args: unknown[]) => {
    const [view, prevState] = args as [EditorView, EditorState];
    this.performUpdate(view, prevState);
  });

  update(view: EditorView, prevState: EditorState) {
    if (composition) return;

    // Use debounced update for rapid typing
    this.debouncedUpdate(view, prevState);
  }

  private performUpdate(view: EditorView, prevState: EditorState) {
    const { selection, schema, tr } = view.state;
    if (view.state.doc.eq(prevState.doc)) return;

    perfMonitor.startTimer('pageUpdate');

    const domAtPos = view.domAtPos.bind(view);

    // Get deleting state from plugin state instead of window
    const pluginState = paginationPluginKey.getState(view.state);
    const deleting = pluginState?.deleting ?? false;

    const pageNodeType = schema.nodes[PAGE];
    if (!pageNodeType) return;
    const pageDOM = findParentDomRefOfType(pageNodeType, domAtPos)(selection);
    if (!pageDOM) return;
    const pageBody = (pageDOM as HTMLElement).querySelector(this.#pageClass);
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
        if (inserting) tr.setMeta('inserting', inserting);
        if (deleting) {
          tr.setMeta('deleting', true);
        }
        view.dispatch(tr);
      }
    }

    perfMonitor.endTimer('pageUpdate');
  }
}
export const paginationPluginKey = new PluginKey('pagination');
export const pagePlugin = (editor: Editor, bodyOption: PageOptions) => {
  const plugin: Plugin = new Plugin<PageState>({
    key: paginationPluginKey,
    view: () => {
      return new PageDetector(editor, bodyOption);
    },
    state: {
      init: (): PageState => {
        return new PageState(bodyOption, false, false, false);
      },

      apply: (tr, prevState): PageState => {
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
            (node.attrs as Record<string, unknown>).id = getId();
          }
        });
        return slice;
      },
      transformCopied(slice) {
        if (slice.content.firstChild?.type.name == 'page') {
          const nodes: Node[] = [];
          slice.content.content.forEach((node) =>
            node.content.forEach((n) => {
              const clonedNode = n.copy(n.content);
              nodes.push(clonedNode);
            })
          );
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
