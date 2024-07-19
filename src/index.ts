export const returnFullTextSearchFilteredData = <
  T extends { [Key: string]: any },
>({
  data,
  searchRequirement,
  searchFilterText,
}: {
  data: Array<T>;
  searchRequirement: Array<{
    value: string;
    removeCharacters?: string;
  }>;
  searchFilterText: string;
}) => {
  if (!searchFilterText) {
    return data;
  }

  return data.filter((item) => {
    return fullTextSearchCore(item, searchRequirement, searchFilterText);
  });
};

const fullTextSearchCore = <T extends { [Key: string]: any }>(
  dataItem: T | Array<T>,
  searchRequirement: Array<{
    value: string;
    removeCharacters?: string;
  }>,
  searchFilterText: string,
): boolean => {
  return searchRequirement.some((searchItem) => {
    if (Array.isArray(dataItem)) {
      const checkRequirements = dataItem.reduce<Array<boolean>>((acc, cur) => {
        const convertedText = () => {
          if (cur?.removeCharacters) {
            return cur[searchItem.value].replaceAll(cur.removeCharacters, '');
          }
          return cur[searchItem.value];
        };
        return [
          ...acc,
          convertedText().includes(searchFilterText) ||
            createInitialLetterMatcher(searchFilterText).test(convertedText()),
        ];
      }, []);
      return checkRequirements.includes(true);
    }
    const value = dataItem[searchItem.value];
    const isKorean = /[ㄱ-ㅎ가-힣]/.test(searchFilterText);
    if (isKorean) {
      return (
        value.includes(searchFilterText) ||
        createInitialLetterMatcher(searchFilterText).test(value)
      );
    }
    return new RegExp(escapeRegExp(searchFilterText), 'i').test(value);
  });
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const charCodeAts: { [Key in string]: number } = {
  ㄱ: '가'.charCodeAt(0),
  ㄲ: '까'.charCodeAt(0),
  ㄴ: '나'.charCodeAt(0),
  ㄷ: '다'.charCodeAt(0),
  ㄸ: '따'.charCodeAt(0),
  ㄹ: '라'.charCodeAt(0),
  ㅁ: '마'.charCodeAt(0),
  ㅂ: '바'.charCodeAt(0),
  ㅃ: '빠'.charCodeAt(0),
  ㅅ: '사'.charCodeAt(0),
} as const;

const characterPatternCheckerCore = (character: string) => {
  const offset = 44032;
  if (/[가-힣]/.test(character)) {
    const chCode = character.charCodeAt(0) - offset;
    if (chCode % 28 > 0) {
      return character;
    }
    const begin = Math.floor(chCode / 28) * 28 + offset;
    const end = begin + 27;
    return `[\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
  }
  if (/[ㄱ-ㅎ]/.test(character)) {
    const begin =
      charCodeAts[character] ||
      (character.charCodeAt(0) - 12613) * 588 + charCodeAts['ㅅ'];
    const end = begin + 587;

    return `[${character}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
  }
  return escapeRegExp(character);
};

const createInitialLetterMatcher = (searchText: string) => {
  const pattern = searchText
    .split('')
    .map((item) => characterPatternCheckerCore(item))
    .join('.*?');
  return new RegExp(pattern);
};
