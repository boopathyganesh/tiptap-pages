import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { PAGE } from '../node-names';
import { emitter } from './events';
/**
 * PageComponent - Renders a document page with header, content, and footer
 *
 * Features:
 * - Dynamic page dimensions based on settings
 * - Header and footer with page numbering
 * - Responsive margins and spacing
 * - Page number display and positioning
 */
export const PageComponent = ({ editor, node, extension }) => {
    const options = extension.options;
    const pageNumber = node.attrs.pageNumber;
    const totalPages = editor.$nodes(PAGE)?.toString()?.split(',')?.length ?? 0;
    // Calculate header height based on page number settings
    const headerHeight = options.pageNumber?.show &&
        options.pageNumber?.position === 'top'
        ? (options.headerHeight ?? 30)
        : 0;
    // Calculate footer height based on page number settings
    const footerHeight = options.pageNumber?.show &&
        options.pageNumber?.position === 'bottom'
        ? (options.footerHeight ?? 30)
        : 0;
    // Generate page number label
    const pageNumberLabel = options.pageNumber?.showCount
        ? `${pageNumber} of ${totalPages}`
        : pageNumber.toString();
    // Handle page change events
    useEffect(() => {
        const handlePageChange = () => { };
        emitter.on('totalPageChange', handlePageChange);
        // Emit event if this is the last page
        if (pageNumber === totalPages) {
            emitter.emit('totalPageChange', totalPages);
        }
        return () => emitter.off('totalPageChange', handlePageChange);
    }, [totalPages, pageNumber]);
    // Calculate dynamic styles with safe defaults
    const pageStyles = {
        height: `${options.bodyHeight}px`,
        width: `${options.bodyWidth}px`,
        paddingTop: `${(options.pageLayout?.margins?.top?.value ?? 0.5) * 96}px`,
        paddingBottom: `${(options.pageLayout?.margins?.bottom?.value ?? 0.5) * 96}px`,
        paddingLeft: `${(options.pageLayout?.margins?.left?.value ?? 0.5) * 96}px`,
        paddingRight: `${(options.pageLayout?.margins?.right?.value ?? 0.5) * 96}px`,
    };
    const headerStyles = {
        height: `${headerHeight}px`,
        width: '100%',
        textAlign: options.pageNumber?.alignment?.toLowerCase(),
    };
    const footerStyles = {
        height: `${footerHeight}px`,
        width: '100%',
        textAlign: options.pageNumber?.alignment?.toLowerCase(),
    };
    const contentStyles = {
        height: `${options.bodyHeight - footerHeight - headerHeight -
            ((options.pageLayout?.margins?.top?.value ?? 0.5) + (options.pageLayout?.margins?.bottom?.value ?? 0.5)) * 96}px`,
        width: `${options.bodyWidth -
            ((options.pageLayout?.margins?.left?.value ?? 0.5) + (options.pageLayout?.margins?.right?.value ?? 0.5)) * 96}px`,
    };
    return (_jsxs(NodeViewWrapper, { onContextMenu: () => false, className: "Page prose prose-base relative mx-auto my-2 transform rounded-xl border border-grey-150 bg-white shadow-[0px_0px_8px_0px_rgba(32,33,36,0.20)]", id: node.attrs.id, style: pageStyles, children: [headerHeight > 0 && (_jsx("div", { className: "header pointer-events-none relative", style: headerStyles, children: options.pageNumber?.position === 'top' &&
                    (options.pageNumber?.showOnFirstPage || pageNumber !== 1) &&
                    pageNumberLabel })), _jsx(NodeViewContent, { className: "PageContent overflow-hidden", style: contentStyles }), footerHeight > 0 && (_jsx("div", { className: "footer relative", style: footerStyles, children: options.pageNumber?.position === 'bottom' &&
                    (options.pageNumber?.showOnFirstPage || pageNumber !== 1) &&
                    pageNumberLabel }))] }));
};
