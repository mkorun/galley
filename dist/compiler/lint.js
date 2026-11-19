/** Names used by generated runtime calls must not be shadowed by template declarations. */
const GENERATED_GLOBALS = new Set(['String', 'Object', 'Array', 'TypeError']);
export const lintAst = (ast, options = {}) => {
    const diagnostics = [];
    const declarations = new Set();
    const used = new Set();
    const duplicate = new Set();
    const report = (diagnostic) => diagnostics.push(diagnostic);
    // parseCore builds pipe inputs and unary/binary operands without pipes; only arguments can nest pipes.
    const expression = (expr) => {
        if (expr.kind === 'pipe') {
            for (const pipe of expr.pipes) {
                if (options.knownFilters && !options.knownFilters.has(pipe.name))
                    report({ code: 'G3001', severity: 'warning', message: `Unknown pipe ${JSON.stringify(pipe.name)}`, span: pipe.span, help: 'Check the spelling or add the custom filter to knownFilters.' });
                for (const arg of pipe.args)
                    expression(arg);
            }
        }
    };
    const resolve = (scope, name) => {
        for (let current = scope; current; current = current.parent) {
            const snippet = current.snippets.get(name);
            if (snippet)
                return snippet;
        }
        return undefined;
    };
    const visit = (nodes, parent, sameScope = false) => {
        const local = sameScope ? parent.snippets : new Map();
        const declare = (items) => {
            for (const node of items) {
                if (node.kind === 'partial' && node.children) {
                    declare(node.children);
                    continue;
                }
                if (node.kind !== 'snippet')
                    continue;
                declarations.add(node);
                if (local.has(node.name)) {
                    duplicate.add(node);
                    report({ code: 'G3003', severity: 'error', message: `Duplicate snippet ${JSON.stringify(node.name)} in the same block`, span: node.span, help: 'Rename one snippet or move it to a different lexical block.' });
                }
                else
                    local.set(node.name, node);
            }
        };
        if (!sameScope)
            declare(nodes);
        const scope = sameScope ? parent : { parent, snippets: local };
        for (const node of nodes) {
            if ((node.kind === 'const' || node.kind === 'snippet') && GENERATED_GLOBALS.has(node.name))
                report({ code: 'G3007', severity: 'error', message: `The name ${node.name} is needed by the generated code`, span: node.span });
            switch (node.kind) {
                case 'output':
                    expression(node.expression);
                    if (node.raw)
                        report({ code: 'G3002', severity: 'info', message: 'Raw output bypasses HTML escaping', span: node.span, help: 'Use raw output only for trusted HTML.' });
                    break;
                case 'const':
                    expression(node.expression);
                    break;
                case 'if':
                    for (const branch of node.branches) {
                        if (branch.condition)
                            expression(branch.condition);
                        visit(branch.children, scope);
                    }
                    break;
                case 'each':
                    visit(node.children, scope);
                    break;
                case 'partial':
                    if (node.children)
                        visit(node.children, scope, true);
                    break;
                case 'snippet':
                    visit(node.children, scope);
                    break;
                case 'render': {
                    const snippet = resolve(scope, node.name);
                    if (snippet)
                        used.add(snippet);
                    else
                        report({ code: 'G3005', severity: 'error', message: `Snippet ${JSON.stringify(node.name)} is not visible in this block`, span: node.span, help: 'Declare the snippet in this block or an enclosing block before rendering it.' });
                    if (node.argument)
                        expression(node.argument);
                    break;
                }
                case 'js':
                    if (!options.allowCode)
                        report({ code: 'G3004', severity: 'error', message: '{@js} requires allowCode: true', span: node.span });
                    break;
            }
        }
    };
    visit(ast.children, null);
    for (const node of declarations)
        if (!used.has(node) && !duplicate.has(node))
            report({ code: 'G3006', severity: 'warning', message: `Snippet ${JSON.stringify(node.name)} is never rendered`, span: node.span });
    return diagnostics;
};
//# sourceMappingURL=lint.js.map