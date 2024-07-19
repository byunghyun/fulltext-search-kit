export declare const returnFullTextSearchFilteredData: <T extends {
    [Key: string]: any;
}>({ data, searchRequirement, searchFilterText, }: {
    data: Array<T>;
    searchRequirement: Array<{
        value: string;
        removeCharacters?: string;
    }>;
    searchFilterText: string;
}) => T[];
export declare const fullTextSearchCore: <T extends {
    [Key: string]: any;
}>(dataItem: T | Array<T>, searchRequirement: Array<{
    value: string;
    removeCharacters?: string;
}>, searchFilterText: string) => boolean;
export declare const escapeRegExp: (string: string) => string;
export declare const characterPatternCheckerCore: (character: string) => string;
export declare const createInitialLetterMatcher: (searchText: string) => RegExp;
