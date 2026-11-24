import type { TemplateAst } from './ast.js';
import type { SourceSpan } from './types.js';
/** The only HTML reader: accept writing rules, without predicting browser repair. */
export declare const readContexts: (ast: TemplateAst, strictBraces?: boolean, scripted?: ReadonlySet<SourceSpan>) => TemplateAst;
//# sourceMappingURL=context.d.ts.map