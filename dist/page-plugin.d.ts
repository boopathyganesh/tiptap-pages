import { Plugin, PluginKey } from '@tiptap/pm/state';
import { type Editor } from '@tiptap/core';
import { type PageOptions } from './types';
export declare const paginationPluginKey: PluginKey<any>;
export declare const pagePlugin: (editor: Editor, bodyOption: PageOptions) => Plugin<any>;
