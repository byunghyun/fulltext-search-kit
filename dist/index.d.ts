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
