/**
 * @deprecated Use `fullTextSearch` instead.
 */
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

export const fullTextSearch = <T extends { [Key: string]: any }>({
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

// 핵심 개선된 부분
const fullTextSearchCore = <T extends { [Key: string]: any }>(
  dataItem: T,
  searchRequirement: Array<{
    value: string;
    removeCharacters?: string;
  }>,
  searchFilterText: string,
): boolean => {
  return searchRequirement.some((searchItem) => {
    const value = dataItem[searchItem.value];
    if (typeof value !== 'string') return false;

    const convertedText = searchItem?.removeCharacters
      ? value.replace(
          new RegExp(`[${escapeRegExp(searchItem.removeCharacters)}]`, 'g'),
          '',
        )
      : value;

    const isKorean = /[ㄱ-ㅎ가-힣]/.test(searchFilterText);
    if (isKorean) {
      const initials = getInitials(convertedText);
      return initials.includes(searchFilterText);
    }

    return new RegExp(escapeRegExp(searchFilterText), 'i').test(convertedText);
  });
};

// 초성만 추출하는 로직
const getInitials = (text: string): string => {
  const initials = [];

  for (let char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const cho = Math.floor((code - 0xac00) / 588);
      initials.push('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[cho]);
    }
  }

  return initials.join('');
};

const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// 이하 함수들은 유지 (미사용 가능성 있음)
// const charCodeAts: { [Key in string]: number } = {
//   ㄱ: '가'.charCodeAt(0),
//   ㄲ: '까'.charCodeAt(0),
//   ㄴ: '나'.charCodeAt(0),
//   ㄷ: '다'.charCodeAt(0),
//   ㄸ: '따'.charCodeAt(0),
//   ㄹ: '라'.charCodeAt(0),
//   ㅁ: '마'.charCodeAt(0),
//   ㅂ: '바'.charCodeAt(0),
//   ㅃ: '빠'.charCodeAt(0),
//   ㅅ: '사'.charCodeAt(0),
// } as const;

// const characterPatternCheckerCore = (character: string) => {
//   const offset = 44032;
//   if (/[가-힣]/.test(character)) {
//     const chCode = character.charCodeAt(0) - offset;
//     if (chCode % 28 > 0) {
//       return character;
//     }
//     const begin = Math.floor(chCode / 28) * 28 + offset;
//     const end = begin + 27;
//     return `[\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
//   }
//   if (/[ㄱ-ㅎ]/.test(character)) {
//     const begin =
//       charCodeAts[character] ||
//       (character.charCodeAt(0) - 12613) * 588 + charCodeAts['ㅅ'];
//     const end = begin + 587;

//     return `[${character}\\u${begin.toString(16)}-\\u${end.toString(16)}]`;
//   }
//   return escapeRegExp(character);
// };

// const createInitialLetterMatcher = (searchText: string) => {
//   const pattern = searchText
//     .split('')
//     .map((item) => characterPatternCheckerCore(item))
//     .join('.*?');
//   return new RegExp(pattern);
// };
