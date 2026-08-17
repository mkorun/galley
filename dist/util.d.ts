export declare const stripWhitespace: (val: string) => string;
declare const util: {
    upper: (s: string) => string;
    lower: (s: string) => string;
    capitalize: (s: string) => string;
    trim: (s: string) => string;
    truncate: (s: string, n: number, suffix?: string) => string;
    replace: (s: string, from: string, to: string) => string;
    striptags: (s: string) => string;
    slugify: (s: string) => string;
    isoDate: (s: string) => string;
    dateFormat: (s: string, fmt: string) => string;
    dateShort: (s: string, locale: string) => string;
    dateDay: (s: string) => string;
    dateMonthShort: (s: string, locale: string) => string;
    join: (arr: unknown[], sep?: string) => string;
    first: (arr: unknown[]) => unknown;
    last: (arr: unknown[]) => unknown;
    length: (val: unknown[] | string) => number;
    round: (n: number, decimals?: number) => number;
    number: (n: number, locale?: string) => string;
    stripWhitespace: (val: string) => string;
};
export default util;
//# sourceMappingURL=util.d.ts.map