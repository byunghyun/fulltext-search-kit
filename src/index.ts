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

// 핵심 로직
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
      const initialsList = getInitialsList(convertedText); // ✨ 단어별 초성 리스트
      return initialsList.some((initials) =>
        initials.includes(searchFilterText),
      );
    }

    return new RegExp(escapeRegExp(searchFilterText), 'i').test(convertedText);
  });
};

// ✅ 단어별 초성만 추출한 배열 리턴
const getInitialsList = (text: string): string[] => {
  return text
    .split(/\s+/) // 띄어쓰기 기준
    .map((word) => {
      const initials = [];
      for (let char of word) {
        const code = char.charCodeAt(0);
        if (code >= 0xac00 && code <= 0xd7a3) {
          const cho = Math.floor((code - 0xac00) / 588);
          initials.push('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[cho]);
        }
      }
      return initials.join('');
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

// 아래 함수들은 현재 사용되지 않음 (옵션 확장용으로만 유지)
// const createInitialLetterMatcher = (searchText: string) => {
//   const pattern = searchText
//     .split('')
//     .map((item) => characterPatternCheckerCore(item))
//     .join('.*?');
//   return new RegExp(pattern);
// };
