'use client';
import { DOMSerializer, Node } from '@tiptap/pm/model';
import { createHTMLDocument } from 'zeed-dom';
import { LRUCache } from './utils/lru-cache';
import { getId } from './utils/node';
export const getBodyHeight = (options) => {
    const { pageLayout, pageNumber } = options;
    const converter = new UnitConversion();
    const headerHeight = pageNumber?.show && pageNumber?.position === 'top'
        ? (options.headerHeight ?? 30)
        : 0;
    const footerHeight = pageNumber?.show && pageNumber?.position === 'bottom'
        ? (options.footerHeight ?? 30)
        : 0;
    // Properly convert margin units based on type (CM or INCHES)
    let marginHeight = 96; // Default 1 inch
    if (pageLayout?.margins) {
        const topValue = pageLayout.margins.top.unit === 'CM'
            ? converter.mmConversionPx(pageLayout.margins.top.value * 10) // CM to mm to px
            : pageLayout.margins.top.value * 96; // INCHES to px
        const bottomValue = pageLayout.margins.bottom.unit === 'CM'
            ? converter.mmConversionPx(pageLayout.margins.bottom.value * 10)
            : pageLayout.margins.bottom.value * 96;
        marginHeight = topValue + bottomValue;
    }
    return options.bodyHeight - marginHeight - (headerHeight + footerHeight);
};
export const getBodyWidth = (options) => {
    const { pageLayout } = options;
    const converter = new UnitConversion();
    // Properly convert margin units based on type (CM or INCHES)
    let marginWidth = 96; // Default 1 inch
    if (pageLayout?.margins) {
        const leftValue = pageLayout.margins.left.unit === 'CM'
            ? converter.mmConversionPx(pageLayout.margins.left.value * 10) // CM to mm to px
            : pageLayout.margins.left.value * 96; // INCHES to px
        const rightValue = pageLayout.margins.right.unit === 'CM'
            ? converter.mmConversionPx(pageLayout.margins.right.value * 10)
            : pageLayout.margins.right.value * 96;
        marginWidth = leftValue + rightValue;
    }
    return options.bodyWidth - marginWidth;
};
export function getHTMLFromFragment(doc, schema, options) {
    if (options?.document) {
        const wrap = options.document.createElement('div');
        DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: options.document }, wrap);
        return wrap.innerHTML;
    }
    const zeedDocument = DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: createHTMLDocument() });
    return zeedDocument.render();
}
export function getFlag(cnode, schema) {
    const paragraphDOM = document.querySelector("[data-id='" + cnode.attrs.id + "']") ||
        iframeDoc?.querySelector("[data-id='" + cnode.attrs.id + "']");
    if (!paragraphDOM)
        return null;
    const width = paragraphDOM.getBoundingClientRect().width;
    const html = generateHTML(getJsonFromDoc(cnode), schema);
    const { width: wordWidth } = computedWidth(html, false);
    if (width >= wordWidth) {
        return false;
    }
    let strLength = 0;
    cnode.descendants((node) => {
        if (node.isText) {
            const nodeText = node.text;
            if (nodeText) {
                for (let i = 0; i < nodeText.length; i++) {
                    const { width: charWidth } = computedWidth(nodeText.charAt(i));
                    if (strLength + charWidth > width) {
                        strLength = charWidth;
                    }
                    else {
                        strLength += charWidth;
                    }
                }
            }
        }
        else {
            const html = generateHTML(getJsonFromDoc(node), schema);
            const { width: nodeWidth } = computedWidth(html);
            if (strLength + nodeWidth > width) {
                strLength = nodeWidth;
            }
            else {
                strLength += nodeWidth;
            }
        }
    });
    const fontSize = parseFloat(window.getComputedStyle(paragraphDOM).getPropertyValue('font-size'));
    return Math.abs(strLength - width) < fontSize;
}
// Use LRU cache to prevent unbounded memory growth (max 100 entries)
const htmlCache = new LRUCache(100);
export function generateHTML(doc, schema) {
    const cacheKey = JSON.stringify(doc);
    const cached = htmlCache.get(cacheKey);
    if (cached !== undefined) {
        return cached;
    }
    const contentNode = Node.fromJSON(schema, doc);
    const html = getHTMLFromFragment(contentNode, schema);
    htmlCache.set(cacheKey, html);
    return html;
}
function createAndCalculateHeight(node, content, splitContext) {
    const calculateNode = node.type.create(node.attrs, content, node.marks);
    const htmlNode = generateHTML(getJsonFromDoc(calculateNode), splitContext.schema);
    const htmlNodeHeight = computedHeight(htmlNode, node.attrs.id);
    return htmlNodeHeight;
}
function calculateNodeOverflowHeightAndPoint(node, dom, splitContext) {
    let height = splitContext.getAccumulatedHeight() === 0
        ? splitContext.getHeight()
        : splitContext.getHeight() - splitContext.getAccumulatedHeight();
    height -= parseFloat(window.getComputedStyle(dom).getPropertyValue('margin-bottom'));
    if (dom.parentElement?.firstChild === dom) {
        height -= parseFloat(window.getComputedStyle(dom).getPropertyValue('margin-top'));
    }
    let lastChild = node.lastChild;
    const childCount = node.childCount;
    let point = {};
    const content = [...(node.content?.content ?? [])];
    for (let i = childCount - 1; i >= 0; i--) {
        lastChild = content[i];
        if (lastChild?.isText) {
            const text = lastChild.text ?? '';
            const breakIndex = binarySearchTextBreak(text, node, i, content, height, splitContext, lastChild.marks);
            if (breakIndex > 0) {
                const partialText = text.slice(0, breakIndex);
                const htmlNodeHeight = createAndCalculateHeight(node, [...content.slice(0, i), splitContext.schema.text(partialText, lastChild.marks)], splitContext);
                point = { i, calculateLength: breakIndex };
                content[i] = splitContext.schema.text(partialText, lastChild.marks);
                if (height > htmlNodeHeight)
                    break;
            }
        }
        else {
            const htmlNodeHeight = createAndCalculateHeight(node, [...content.slice(0, i), lastChild], splitContext);
            if (height > htmlNodeHeight) {
                point = { i, calculateLength: 0 };
                break;
            }
        }
    }
    let isFlag = true;
    let index = 0;
    node.descendants((_node, pos, _, i) => {
        if (!isFlag) {
            return isFlag;
        }
        if (i === point.i) {
            index = pos + (point.calculateLength !== undefined ? point.calculateLength : 0) + 1;
            isFlag = false;
        }
    });
    return index;
}
function binarySearchTextBreak(fullText, node, indexInContent, content, heightLimit, splitContext, marks) {
    let low = 1;
    let high = fullText.length;
    let validBreak = 0;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        let candidate = fullText.slice(0, mid);
        let lastSpaceIndex = candidate.lastIndexOf(' ');
        if (lastSpaceIndex < 0) {
            if (candidate.length > 7) {
                lastSpaceIndex = candidate.length;
            }
            else {
                return 0;
            }
        }
        candidate = candidate.slice(0, lastSpaceIndex);
        if (candidate.length === 0) {
            if (mid > 1) {
                candidate = fullText.slice(0, 1);
            }
            else {
                return 0;
            }
        }
        const candidateHeight = createAndCalculateHeight(node, [...content.slice(0, indexInContent), splitContext.schema.text(candidate, marks)], splitContext);
        if (candidateHeight <= heightLimit) {
            validBreak = lastSpaceIndex > 0 ? lastSpaceIndex : candidate.length;
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
    }
    return validBreak;
}
export function getBreakPos(cnode, dom, splitContext) {
    const paragraphDOM = dom;
    if (!paragraphDOM)
        return null;
    const width = paragraphDOM.offsetWidth;
    const html = generateHTML(getJsonFromDoc(cnode), splitContext.schema);
    const { width: wordWidth } = computedWidth(html, false);
    if (width >= wordWidth) {
        return null;
    }
    const index = calculateNodeOverflowHeightAndPoint(cnode, dom, splitContext);
    return index || null;
}
export function getJsonFromDoc(node) {
    return {
        type: 'doc',
        content: [node.toJSON()],
    };
}
export function getJsonFromDocForJson(json) {
    return {
        type: 'doc',
        content: [json],
    };
}
let iframeComputed = null;
let iframeDoc = null;
export function getBlockHeight(node) {
    const paragraphDOM = document.querySelector("[data-id='" + node.attrs.id + "']");
    if (paragraphDOM) {
        return paragraphDOM.offsetHeight;
    }
    return 0;
}
function findTextblockHacksIds(node) {
    const ids = [];
    node.descendants((node) => {
        if (node.isTextblock && node.childCount === 0) {
            ids.push(node.attrs.id);
        }
    });
    return ids;
}
export class UnitConversion {
    constructor() {
        this.arrDPI = [];
        const arr = [];
        if (typeof window === 'undefined')
            return;
        // Check for legacy IE deviceXDPI/deviceYDPI properties
        const screen = window.screen;
        if (screen.deviceXDPI) {
            arr.push(screen.deviceXDPI);
            arr.push(screen.deviceYDPI ?? screen.deviceXDPI);
        }
        else {
            const tmpNode = document.createElement('DIV');
            tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:-99;visibility:hidden';
            document.body.appendChild(tmpNode);
            arr.push(tmpNode.offsetWidth);
            arr.push(tmpNode.offsetHeight);
            if (tmpNode?.parentNode) {
                tmpNode.parentNode.removeChild(tmpNode);
            }
        }
        this.arrDPI = arr;
    }
    pxConversionMm(value) {
        const inch = value / (this.arrDPI[0] ?? 96);
        const mmValue = inch * 25.4;
        return Number(mmValue.toFixed());
    }
    mmConversionPx(value) {
        const inch = value / 25.4;
        const pxValue = inch * (this.arrDPI[0] ?? 96);
        return Number(pxValue.toFixed());
    }
    ptConversionPx(value) {
        return (value * 96) / 72;
    }
    pxConversionPt(value) {
        return (value * 72) / 96;
    }
}
const dimensionCache = new Map();
const valueCache = new Map();
export function computedHeight(html, id) {
    const computeddiv = iframeDoc?.getElementById('computeddiv');
    if (computeddiv && computeddiv instanceof HTMLElement) {
        computeddiv.innerHTML = html;
        const htmldiv = iframeDoc?.querySelector("[data-id='" + id + "']");
        if (!htmldiv)
            return 0;
        const computedStyle = window.getComputedStyle(htmldiv);
        const height = htmldiv.getBoundingClientRect().height + parseFloat(computedStyle.marginTop);
        computeddiv.innerHTML = '&nbsp;';
        return height;
    }
    return 0;
}
export function computedWidth(html, cache = true) {
    if (dimensionCache.has(html)) {
        return dimensionCache.get(html);
    }
    const computedspan = iframeDoc?.getElementById('computedspan');
    if (html === ' ') {
        html = '&nbsp;';
    }
    if (computedspan) {
        computedspan.innerHTML = html;
        const computedStyle = window.getComputedStyle(computedspan);
        const width = computedspan.getBoundingClientRect().width;
        const height = computedspan.getBoundingClientRect().height +
            parseFloat(computedStyle.marginTop) +
            parseFloat(computedStyle.marginBottom);
        if (cache) {
            dimensionCache.set(html, { height, width });
        }
        computedspan.innerHTML = '&nbsp;';
        return { height, width };
    }
    return { height: 0, width: 0 };
}
export function getContentSpacing(dom) {
    const content = dom.querySelector('.content');
    if (dom && content && content instanceof HTMLElement) {
        const contentStyle = window.getComputedStyle(content);
        const paddingTop = contentStyle.getPropertyValue('padding-top');
        const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
        const marginTop = contentStyle.getPropertyValue('margin-top');
        const marginBottom = contentStyle.getPropertyValue('margin-bottom');
        const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
        const margin = parseFloat(marginTop) + parseFloat(marginBottom);
        return padding + margin + (dom.offsetHeight - content.offsetHeight);
    }
    return 0;
}
/**
 * Get spacing for a DOM element
 * @param dom - The DOM element to measure
 * @returns Total spacing in pixels
 */
export function getSpacing(dom) {
    const contentStyle = window.getComputedStyle(dom);
    const paddingTop = contentStyle.getPropertyValue('padding-top');
    const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
    const marginTop = contentStyle.getPropertyValue('margin-top');
    const marginBottom = contentStyle.getPropertyValue('margin-bottom');
    const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
    const margin = parseFloat(marginTop) + parseFloat(marginBottom);
    return padding + margin;
}
/**
 * Get default height from cache or calculate it
 * @returns Default height in pixels
 */
export function getDefault() {
    if (valueCache.has('defaultheight')) {
        return valueCache.get('defaultheight');
    }
    const computedspan = iframeDoc?.getElementById('computedspan');
    const defaultHeight = computedspan ? getDomHeight(computedspan) : 0;
    valueCache.set('defaultheight', defaultHeight);
    return defaultHeight;
}
/**
 * Get padding, margin, and border for a DOM element
 * @param dom - The DOM element to measure
 * @returns Total spacing including borders in pixels
 */
export function getDomPaddingAndMargin(dom) {
    const contentStyle = window.getComputedStyle(dom) ||
        iframeComputed?.contentWindow?.getComputedStyle(dom);
    const paddingTop = contentStyle.getPropertyValue('padding-top');
    const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
    const marginTop = contentStyle.getPropertyValue('margin-top');
    const marginBottom = contentStyle.getPropertyValue('margin-bottom');
    const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
    const margin = parseFloat(marginTop) + parseFloat(marginBottom);
    const border = parseFloat(contentStyle.borderWidth);
    return padding + margin + border;
}
/**
 * Get the total height of a DOM element including margins and padding
 * @param dom - The DOM element to measure
 * @returns Total height in pixels
 */
export function getDomHeight(dom) {
    const contentStyle = window.getComputedStyle(dom) ||
        iframeComputed?.contentWindow?.getComputedStyle(dom);
    const nextSiblingStyle = dom.nextElementSibling
        ? window.getComputedStyle(dom.nextElementSibling) ||
            iframeComputed?.contentWindow?.getComputedStyle(dom.nextElementSibling)
        : null;
    const paddingTop = contentStyle.getPropertyValue('padding-top');
    const paddingBottom = contentStyle.getPropertyValue('padding-bottom');
    const marginTop = contentStyle.getPropertyValue('margin-top');
    const isFirstChild = dom.parentElement?.firstElementChild === dom;
    const marginBottom = Math.max(parseFloat(contentStyle.getPropertyValue('margin-bottom')), parseFloat(nextSiblingStyle?.getPropertyValue('margin-top') ?? '0'));
    const padding = parseFloat(paddingTop) + parseFloat(paddingBottom);
    const isListItem = dom.tagName === 'LI';
    const margin = isFirstChild || isListItem ? parseFloat(marginTop) + marginBottom : marginBottom;
    return padding + margin + dom.offsetHeight + parseFloat(contentStyle.borderWidth);
}
export function getAbsentHtmlH(node, schema) {
    if (!node.attrs.id && node.attrs && typeof node.attrs === 'object') {
        node.attrs.id = getId();
    }
    const ids = findTextblockHacksIds(node);
    const html = generateHTML(getJsonFromDoc(node), schema);
    const computeddiv = iframeDoc?.getElementById('computeddiv');
    if (computeddiv) {
        computeddiv.innerHTML = html;
        ids.forEach((id) => {
            const nodeHtml = iframeDoc?.querySelector("[data-id='" + id + "']");
            if (nodeHtml) {
                nodeHtml.innerHTML = "<br class='ProseMirror-trailingBreak'>";
            }
        });
    }
    const nodeElement = iframeDoc?.querySelector("[data-id='" + node.attrs.id + "']");
    return nodeElement;
}
export function removeAbsentHtmlH() {
    const computeddiv = iframeDoc?.getElementById('computeddiv');
    if (computeddiv && computeddiv instanceof HTMLElement) {
        computeddiv.innerHTML = '';
    }
}
function iframeDocAddP() {
    const computedspan = iframeDoc?.getElementById('computedspan');
    if (!computedspan) {
        const p = iframeDoc?.createElement('p');
        if (!p)
            return;
        p.classList.add('text-editor');
        p.setAttribute('id', 'computedspan');
        p.setAttribute('style', 'display: inline-block');
        p.innerHTML = '&nbsp;';
        iframeDoc?.body.append(p);
    }
}
function iframeDocAddDiv(options) {
    const computeddiv = iframeDoc?.getElementById('computeddiv');
    if (!computeddiv) {
        const dom = iframeDoc?.createElement('div');
        if (!dom)
            return;
        dom.setAttribute('class', 'Page prose prose-base text-text-900 font-arial');
        dom.setAttribute('style', 'opacity: 0;position: absolute;max-width:' +
            getBodyWidth(options) +
            'px;width:' +
            getBodyWidth(options) +
            'px; padding: 0px !important; overflow-wrap: break-word; line-height: 2;');
        const content = iframeDoc?.createElement('div');
        if (!content)
            return;
        content.classList.add('PageContent');
        content.setAttribute('style', 'min-height: ' + getBodyHeight(options) + 'px;');
        content.setAttribute('id', 'computeddiv');
        dom.append(content);
        iframeDoc?.body.append(dom);
    }
}
export function removeComputedHtml() {
    const iframeComputed1 = document.getElementById('computediframe');
    if (iframeComputed1) {
        document.body.removeChild(iframeComputed1);
        iframeComputed = null;
        iframeDoc = null;
    }
}
export function buildComputedHtml(options) {
    removeComputedHtml();
    iframeComputed = document.createElement('iframe');
    document.body.appendChild(iframeComputed);
    // Get the document object
    iframeDoc = iframeComputed?.contentDocument || iframeComputed?.contentWindow?.document;
    iframeComputed?.setAttribute('id', 'computediframe');
    iframeComputed?.setAttribute('style', 'width: 100%;height: 100%; position: absolute; top:-4003px; left:-4003px; z-index: -89;');
    if (!iframeDoc)
        return;
    copyStylesToIframe(iframeDoc);
    iframeDocAddP();
    iframeDocAddDiv(options);
}
function copyStylesToIframe(iframeContentDoc) {
    const links = document.getElementsByTagName('link');
    for (const link of links) {
        if (link?.rel === 'stylesheet') {
            const newLink = iframeContentDoc.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.type = 'text/css';
            newLink.href = link?.href ?? '';
            iframeContentDoc.head.appendChild(newLink);
        }
    }
    const styles = document.querySelectorAll('style');
    styles.forEach((style) => {
        const newStyle = iframeContentDoc.createElement('style');
        newStyle.textContent = style.textContent;
        iframeContentDoc.head.appendChild(newStyle);
    });
    const elementsWithInlineStyles = document.querySelectorAll('[style]');
    for (const element of elementsWithInlineStyles) {
        const styleAttr = element.getAttribute('style');
        const clonedElement = iframeContentDoc.createElement(element.tagName);
        clonedElement.setAttribute('style', styleAttr);
    }
    iframeDoc?.body.classList.add('prose', 'prose-base');
}
