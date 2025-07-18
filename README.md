# fulltext-search-kit

![npm](https://img.shields.io/npm/v/fulltext-search-kit)
![license](https://img.shields.io/npm/l/fulltext-search-kit)

- A utility library for full-text search in TypeScript.
- I have no intention of removing this package until npm ceases to exist.

## Features

- Full-text search functionality
- Supports multiple search requirements
- Handles special character removal
- Optimized for Korean text
- Supports 초성 (initial consonant) search in Korean
- Supports mixed search terms like ‘한ㄱㅇ’ (partially composed + initials)
- Highlights matched search terms

## Live Demo

[demo](https://codesandbox.io/p/devbox/fulltext-search-kit-forked-jgttr4?file=%2Fpackage.json%3A5%2C16)

## Installation

You can install the library using npm:

```
npm install fulltext-search-kit
```

or using yarn:

```
yarn add fulltext-search-kit
```

## Usage

### Importing the Library

To use the latest full-text search functionality:

```
import { fullTextSearch, getFullTextSearchHighlights } from 'fulltext-search-kit';
```

> ⚠️ **Deprecated Notice**  
> `returnFullTextSearchFilteredData` will be removed in version 3.0.0.  
> Please migrate to `fullTextSearch` and `getFullTextSearchHighlights` for all new development.

### Basic Example

```
const data = [
  { name: 'John Doe01012', age: 30, phoneNumber: '010-2345-7890' },
  { name: 'Jane Smith01023', age: 25, phoneNumber: '010-1234-5678' },
  { name: 'Alice Johnson01023', age: 35, phoneNumber: '010-5500-4455' },
];

const filteredData = fullTextSearch({
  data,
  searchRequirement: [
    { value: 'name', keywords: ['Jane'] },
    { value: 'phoneNumber', keywords: ['0101234'] },
  ],
});
```

### Highlight Example

```
const highlights = getFullTextSearchHighlights({
  item: data[1],
  searchRequirement: [
    { value: 'name', keywords: ['Jane'] },
    { value: 'phoneNumber', keywords: ['0101234'] },
  ],
});
```

### Korean Initials & Mixed Term Example

```
const filtered = fullTextSearch({
  data,
  searchRequirement: [
    { value: 'name', keywords: ['한ㄱㅇ'] }, // matches 한가영
  ],
});
```

## API

### fullTextSearch

Filters an array of objects based on search requirements.

#### Parameters

- `data: Array<T>`: The data to search through.
- `searchRequirement: Array<{ value: string; keywords: string[] }>`: The field names and search terms.

#### Returns

- `Array<T>`: The filtered data.

---

### getFullTextSearchHighlights

Returns the matched highlights from a specific item.

#### Parameters

- `item: T`: The data item to check.
- `searchRequirement: Array<{ value: string; keywords: string[] }>`: The fields and search keywords.

#### Returns

- `Partial<Record<keyof T, string>>`: Object with `<mark>`-tagged matched highlights.

---

## Deprecated Functions

### returnFullTextSearchFilteredData ⚠️ _Deprecated_

> This function will be removed in **v3.0.0**.  
> Please migrate to `fullTextSearch`.

```
const filteredData = returnFullTextSearchFilteredData({
  data,
  searchRequirement: [
    { value: 'name' },
    { value: 'phoneNumber', removeCharacters: '-' },
  ],
  searchFilterText: 'Jane',
});
```

---

## Internal Functions (For Contributors)

- `fullTextSearchCore`: Low-level core function
- `escapeRegExp`: Escapes RegExp special chars
- `characterPatternCheckerCore`: Korean pattern generator
- `getInitialsListWithSpaces`: Extracts 초성 list with spacing logic
- `highlightText`: Internal highlighter engine

---

## Changelog (v2.x → v3 Preview)

- ✅ Supports mixed search keywords like `한ㄱㅇ`
- ✅ Highlights matched values
- ✅ `keywords` now supports multiple per field
- ✅ `getFullTextSearchHighlights` function added
- ⚠️ `returnFullTextSearchFilteredData` marked as deprecated

---

## Contributing

- Contributions are welcome!

## License

- This project is licensed under the MIT License - see the LICENSE file for details.

## Author

ByungHyunWoo(KR)
