import { v4 as uuidv4 } from 'uuid';
export function getId() {
    return uuidv4();
}
export const findParentDomRefOfType = (nodeType, domAtPos) => (selection) => {
    return findParentDomRef((node) => equalNodeType(nodeType, node), domAtPos)(selection);
};
export const equalNodeType = (nodeType, node) => {
    return (Array.isArray(nodeType) && nodeType.includes(node.type)) || node.type === nodeType;
};
export const findParentDomRef = (predicate, domAtPos) => (selection) => {
    const parent = findParentNode(predicate)(selection);
    if (parent)
        return findDomRefAtPos(parent.pos, domAtPos);
};
export const findDomRefAtPos = (position, domAtPos) => {
    const dom = domAtPos(position);
    const node = dom.node.childNodes[dom.offset];
    if (dom.node.nodeType === Node.TEXT_NODE)
        return dom.node.parentNode;
    if (!node || node.nodeType === Node.TEXT_NODE)
        return dom.node;
    return node;
};
export const findParentNode = (predicate) => ({ $from }) => findParentNodeClosestToPos($from, predicate);
export const findParentNodeClosestToPos = ($pos, predicate) => {
    for (let i = $pos.depth; i > 0; i--) {
        const node = $pos.node(i);
        if (predicate(node))
            return { pos: i > 0 ? $pos.before(i) : 0, start: $pos.start(i), depth: i, node };
    }
};
export const findChildrenWithPredicate = (predicate) => (node) => {
    const children = [];
    node.descendants((child) => {
        if (predicate(child))
            children.push(child);
        if (child.content.content.length)
            children.push(...findChildrenWithPredicate(predicate)(child));
    });
    return children;
};
export const idAttributes = {
    id: {
        default: null,
    },
    extend: { default: false },
};
