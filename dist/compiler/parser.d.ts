import type { TemplateAst } from './ast.js';
import { type Token } from './lexer.js';
import type { SourceFile } from './types.js';
export declare const parseTokens: (source: SourceFile, input: readonly Token[]) => TemplateAst;
export declare const parse: (source: SourceFile) => TemplateAst;
//# sourceMappingURL=parser.d.ts.map