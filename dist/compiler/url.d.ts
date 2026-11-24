/** Attributes that hold a list of URLs. A browser begins a URL of the list only at its start, after whitespace or after a comma. */
export declare const URL_LISTS: ReadonlySet<string>;
export declare class UrlPrefix {
    readonly attribute: string;
    private mode;
    /** Characters of the scheme candidate that some allowed scheme still matches, and a bit per such scheme. */
    private schemeLength;
    private schemes;
    private readonly chunks;
    /** Nonempty dynamic writes checked so far, including completed dynamic snippet results. */
    checkpoints: number;
    /** In a list, every piece between separators is admitted like a URL of its own. */
    private readonly list;
    constructor(attribute: string);
    /** No later character can make the value another scheme's URL or one that starts with two slashes. A list never settles: its next piece may. */
    get settled(): boolean;
    get forbidden(): boolean;
    /** One character of the value as the browser reads it, without decoding. */
    private read;
    /** Escaped output's & begins one of the five HTML escapes and cannot continue a scheme. */
    feed(text: string, escaped?: boolean): void;
    check(nonempty: boolean): void;
}
//# sourceMappingURL=url.d.ts.map