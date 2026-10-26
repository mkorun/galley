const LOOP_METADATA = new Set(['length', 'isFirst', 'isLast']);
const collectExpressionMetadata = (expression, used) => {
    if (expression.kind === 'path') {
        if (LOOP_METADATA.has(expression.root))
            used.add(expression.root);
        for (const segment of expression.segments)
            if (typeof segment.value === 'object')
                collectExpressionMetadata(segment.value, used);
    }
    else if (expression.kind === 'unary')
        collectExpressionMetadata(expression.operand, used);
    else if (expression.kind === 'binary') {
        collectExpressionMetadata(expression.left, used);
        collectExpressionMetadata(expression.right, used);
    }
    else if (expression.kind === 'pipe') {
        collectExpressionMetadata(expression.input, used);
        for (const pipe of expression.pipes)
            for (const argument of pipe.args)
                collectExpressionMetadata(argument, used);
    }
};
// An output that begins the value of an attribute holding a URL, in an open tag: the scheme is its to decide.
const URL_ATTRIBUTE_START = /^<[a-z][^<>]*\s(href|src|action|formaction|poster|cite|xlink:href)=["']?$/i;
export const analyze = (ast, dynamicEmptyAttributes = true) => {
    const annotate = (nodes, metadata) => {
        let recentText = '';
        let changed = null;
        for (let index = 0; index < nodes.length; index++) {
            const node = nodes[index];
            let annotated = node;
            if (node.kind === 'text')
                recentText += node.value;
            if (node.kind === 'output') {
                if (metadata)
                    collectExpressionMetadata(node.expression, metadata);
                const openTag = recentText.slice(recentText.lastIndexOf('<'));
                if (dynamicEmptyAttributes) {
                    const tagInitial = openTag.charCodeAt(1) | 32;
                    if (tagInitial === 109 && /^<meta\b[^>]*\bcontent=(?:"[^"]*|'[^']*)$/i.test(openTag))
                        annotated = { ...node, emptyAttribute: 'content' };
                    else if (tagInitial === 108 && /^<link\b[^>]*\bhref=(?:"[^"]*|'[^']*)$/i.test(openTag))
                        annotated = { ...node, emptyAttribute: 'href' };
                }
                const url = URL_ATTRIBUTE_START.exec(openTag);
                if (url)
                    annotated = { ...annotated, urlAttribute: url[1].toLowerCase() };
                // what an output wrote is not the start of the attribute value any more
                recentText += '\u0000';
            }
            else if (node.kind === 'const') {
                if (metadata)
                    collectExpressionMetadata(node.expression, metadata);
            }
            else if (node.kind === 'render') {
                if (metadata && node.argument)
                    collectExpressionMetadata(node.argument, metadata);
            }
            else if (node.kind === 'if') {
                let branchChanged = false;
                const branches = node.branches.map(branch => {
                    if (metadata && branch.condition)
                        collectExpressionMetadata(branch.condition, metadata);
                    const children = annotate(branch.children, metadata);
                    if (children === branch.children)
                        return branch;
                    branchChanged = true;
                    return { ...branch, children };
                });
                if (branchChanged)
                    annotated = { ...node, branches };
            }
            else if (node.kind === 'each') {
                const ownMetadata = new Set();
                annotated = { ...node, children: annotate(node.children, ownMetadata), metadata: ownMetadata };
            }
            else if (node.kind === 'snippet') {
                const children = annotate(node.children, metadata);
                if (children !== node.children)
                    annotated = { ...node, children };
            }
            if (annotated !== node) {
                if (!changed)
                    changed = nodes.slice(0, index);
                changed.push(annotated);
            }
            else if (changed)
                changed.push(node);
        }
        return changed ?? nodes;
    };
    const children = annotate(ast.children);
    return children === ast.children ? ast : { ...ast, children };
};
//# sourceMappingURL=analysis.js.map