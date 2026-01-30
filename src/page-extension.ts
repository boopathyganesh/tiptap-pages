import { Extension } from '@tiptap/core';
import { UnitConversion, buildComputedHtml } from './core';
import { type PageOptions, DEFAULT_PAGE_OPTIONS } from './types';
import { pagePlugin } from './page-plugin';
import { PageKeyMap } from './page-key-map';
import { Page } from './page';
import { injectPageExtensionStyles, removePageExtensionStyles } from './css-injector';
import { type PageFormat, pageFormatToOptions, PAGE_FORMATS } from './page-formats';
import {
  BULLETLIST,
  CITATION,
  HARDBREAK,
  HEADING,
  LISTITEM,
  ORDEREDLIST,
  PARAGRAPH,
  RECORDING_LOADER,
  TEMPLATE_VARIABLE,
  TRANSIENT_TEXT,
} from './node-names';
import UniqueID from '@tiptap/extension-unique-id';
import { isChangeOrigin } from '@tiptap/extension-collaboration';


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


const SUPPORTED_NODE_TYPES = [
  HEADING,
  PARAGRAPH,
  BULLETLIST,
  LISTITEM,
  ORDEREDLIST,
  TRANSIENT_TEXT,
  HARDBREAK,
  TEMPLATE_VARIABLE,
  CITATION,
  RECORDING_LOADER,
];


function deepMerge(defaults: PageOptions, userOptions: Partial<PageOptions>): PageOptions {
  const result = { ...defaults };


  if (userOptions.pageLayout) {
    result.pageLayout = {
      margins: {
        top: userOptions.pageLayout.margins?.top ?? defaults.pageLayout?.margins?.top ?? { unit: 'INCHES', value: 0.5 },
        bottom: userOptions.pageLayout.margins?.bottom ?? defaults.pageLayout?.margins?.bottom ?? { unit: 'INCHES', value: 0.5 },
        left: userOptions.pageLayout.margins?.left ?? defaults.pageLayout?.margins?.left ?? { unit: 'INCHES', value: 0.5 },
        right: userOptions.pageLayout.margins?.right ?? defaults.pageLayout?.margins?.right ?? { unit: 'INCHES', value: 0.5 }
      },
      paragraphSpacing: {
        before: userOptions.pageLayout.paragraphSpacing?.before ?? defaults.pageLayout?.paragraphSpacing?.before ?? { unit: 'PTS', value: 6 },
        after: userOptions.pageLayout.paragraphSpacing?.after ?? defaults.pageLayout?.paragraphSpacing?.after ?? { unit: 'PTS', value: 6 }
      }
    };
  }


  if (userOptions.pageNumber) {
    result.pageNumber = {
      show: userOptions.pageNumber.show ?? defaults.pageNumber?.show ?? false,
      showCount: userOptions.pageNumber.showCount ?? defaults.pageNumber?.showCount ?? false,
      showOnFirstPage: userOptions.pageNumber.showOnFirstPage ?? defaults.pageNumber?.showOnFirstPage ?? false,
      position: userOptions.pageNumber.position ?? defaults.pageNumber?.position ?? null,
      alignment: userOptions.pageNumber.alignment ?? defaults.pageNumber?.alignment ?? null
    };
  }


  if (userOptions.bodyHeight !== undefined) result.bodyHeight = userOptions.bodyHeight;
  if (userOptions.bodyWidth !== undefined) result.bodyWidth = userOptions.bodyWidth;
  if (userOptions.bodyPadding !== undefined) result.bodyPadding = userOptions.bodyPadding;
  if (userOptions.headerHeight !== undefined) result.headerHeight = userOptions.headerHeight;
  if (userOptions.footerHeight !== undefined) result.footerHeight = userOptions.footerHeight;
  if (userOptions.types !== undefined) result.types = userOptions.types;
  if (userOptions.headerData !== undefined) result.headerData = userOptions.headerData;
  if (userOptions.footerData !== undefined) result.footerData = userOptions.footerData;

  return result;
}

export const PageExtension = Extension.create<PageOptions>({
  name: 'PageExtension',

  onBeforeCreate() {

    const { bodyHeight, bodyWidth } = this.options;

    if (bodyHeight === undefined || bodyHeight === null) {
      throw new Error(
        'PageExtension: bodyHeight is required but not provided. ' +
        'Please provide a numeric value for bodyHeight in PageExtension.configure().'
      );
    }

    if (bodyWidth === undefined || bodyWidth === null) {
      throw new Error(
        'PageExtension: bodyWidth is required but not provided. ' +
        'Please provide a numeric value for bodyWidth in PageExtension.configure().'
      );
    }

    if (typeof bodyHeight !== 'number' || bodyHeight <= 0) {
      throw new Error(
        `PageExtension: bodyHeight must be a positive number, but got ${bodyHeight}. ` +
        'Please provide a valid numeric value greater than 0.'
      );
    }

    if (typeof bodyWidth !== 'number' || bodyWidth <= 0) {
      throw new Error(
        `PageExtension: bodyWidth must be a positive number, but got ${bodyWidth}. ` +
        'Please provide a valid numeric value greater than 0.'
      );
    }


    this.options = deepMerge(DEFAULT_PAGE_OPTIONS as PageOptions, this.options);
    buildComputedHtml(this.options);
  },

  onCreate() {
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      injectPageExtensionStyles();
    });
  },

  onDestroy() {

    removePageExtensionStyles();
  },

  addProseMirrorPlugins() {
    return [pagePlugin(this.editor, this.options)];
  },

  addStorage() {
    return {
      headerData: this.options?.headerData ?? [],
      footerData: this.options?.footerData ?? [],
    };
  },

  addCommands() {
    return {
      recomputeComputedHtml:
        () =>
          ({ editor }) => {
            const unitConversion = new UnitConversion();
            const { pageLayout } = this.options;

            if (pageLayout?.paragraphSpacing) {
              const topSpacing = unitConversion.ptConversionPx(pageLayout.paragraphSpacing.before.value) * 2;
              const bottomSpacing = unitConversion.ptConversionPx(pageLayout.paragraphSpacing.after.value) * 2;

              document.documentElement.style.cssText =
                `--editor-spacing-top: ${topSpacing}px; --editor-spacing-bottom: ${bottomSpacing}px;`;
            }

            buildComputedHtml(this.options);

            // Use requestAnimationFrame for immediate, smooth updates
            requestAnimationFrame(() => {
              if (editor?.view) {
                editor.view.dispatch(editor.state.tr.setMeta('splitPage', true));
              }
            });

            return true;
          },

      setPageFormat:
        (format: string | PageFormat) =>
          ({ editor }) => {
            try {
              // Get format options
              const formatOptions = typeof format === 'string'
                ? pageFormatToOptions(PAGE_FORMATS[format])
                : pageFormatToOptions(format);

              // Update extension options
              this.options = deepMerge(this.options, formatOptions);

              // Rebuild computed HTML and trigger repagination
              buildComputedHtml(this.options);

              requestAnimationFrame(() => {
                if (editor?.view) {
                  editor.view.dispatch(editor.state.tr.setMeta('splitPage', true));
                }
              });

              return true;
            } catch (error) {
              console.error('Failed to set page format:', error);
              return false;
            }
          },

      setPageGap:
        (gap: number) =>
          () => {
            if (typeof gap !== 'number' || gap < 0) {
              return false;
            }

            // Update CSS variable for page gap
            document.documentElement.style.setProperty('--page-gap', `${gap}px`);

            return true;
          },

      setPageBreakBackground:
        (color: string) =>
          () => {
            if (!color || typeof color !== 'string') {
              return false;
            }

            // Update CSS variable for page break background
            document.documentElement.style.setProperty('--page-break-background', color);
            document.body.style.backgroundColor = color;

            return true;
          },
    };
  },

  addExtensions() {
    return [
      PageKeyMap,
      Page.configure(this.options),
      UniqueID.configure({
        types: SUPPORTED_NODE_TYPES,
        filterTransaction: (transaction) => !isChangeOrigin(transaction),
      }),
    ];
  },
});
