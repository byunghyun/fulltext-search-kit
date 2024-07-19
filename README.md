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
- 한국어 초성 검색도 지원합니다.

## Installation

You can install the library using npm:

```bash
npm install fulltext-search-kit
```

or using yarn:

```bash
yarn add fulltext-search-kit
```

## Usage

### Importing the Library

To use the library, import the returnFullTextSearchFilteredData function:

```typescript
import { returnFullTextSearchFilteredData } from 'fulltext-search-kit';
```

Example
Here is a simple example demonstrating how to use the
returnFullTextSearchFilteredData function:

```typescript
const data = [
  { name: 'John Doe', age: 30 },
  { name: 'Jane Smith', age: 25 },
  { name: 'Alice Johnson', age: 35 },
];

const searchRequirement = [{ value: 'name' }];
const searchFilterText = 'Jane';

const filteredData = returnFullTextSearchFilteredData<T>({
  data,
  searchRequirement,
  searchFilterText,
});

console.log(filteredData);
```

## API

### returnFullTextSearchFilteredData

Filters an array of objects based on the search requirements and filter text.

Parameters

- data (Array<T>): The data to search through.
- searchRequirement (Array<{ value: string; removeCharacters?: string; }>): The requirements for the search.

```example
  text: 010-0000-0000,
  removeCharacters: '-'
  return: 01000000000
```

- searchFilterText (string): The text to filter the data by.

Returns

- Array<T>: The filtered data.

## Internal Functions

### fullTextSearchCore

- Core function for full-text search logic. This function is used internally by returnFullTextSearchFilteredData.

### escapeRegExp

- Escapes special characters in a string for use in a regular expression.

### characterPatternCheckerCore

- Checks and returns a pattern for Korean characters.

### createInitialLetterMatcher

- Creates a regular expression matcher for initial Korean letters.

## Contributing

- Contributions are welcome!

## License

- This project is licensed under the MIT License - see the LICENSE file for details.

## Author

ByungHyunWoo(KR)
