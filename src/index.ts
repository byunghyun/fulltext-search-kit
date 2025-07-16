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

// 하이라이팅 추가된 버전
export const fullTextSearchWithHighlight = <T extends { [Key: string]: any }>({
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
}): Array<{
  item: T;
  highlights: Partial<Record<keyof T, string>>;
}> => {
  if (!searchFilterText) {
    return data.map((item) => ({ item, highlights: {} }));
  }

  return data
    .map((item) => {
      const highlights: Partial<Record<keyof T, string>> = {};
      let matched = false;

      for (const requirement of searchRequirement) {
        const key = requirement.value as keyof T;
        const rawValue = item[key];

        if (typeof rawValue !== 'string') continue;

        const convertedText = requirement?.removeCharacters
          ? rawValue.replace(
              new RegExp(
                `[${escapeRegExp(requirement.removeCharacters)}]`,
                'g',
              ),
              '',
            )
          : rawValue;

        const isKorean = /[ㄱ-ㅎ가-힣]/.test(searchFilterText);

        if (isKorean) {
          const matchedWord = findMatchedWordByInitials(
            convertedText,
            searchFilterText,
          );
          if (matchedWord) {
            matched = true;
            highlights[key] = rawValue.replace(
              matchedWord,
              `<mark>${matchedWord}</mark>`,
            );
          }
        } else {
          const regex = new RegExp(escapeRegExp(searchFilterText), 'gi');
          if (regex.test(convertedText)) {
            matched = true;
            highlights[key] = rawValue.replace(
              regex,
              (match: string) => `<mark>${match}</mark>`,
            );
          }
        }
      }

      return matched ? { item, highlights } : null;
    })
    .filter(Boolean) as Array<{
    item: T;
    highlights: Partial<Record<keyof T, string>>;
  }>;
};

// 기존 검색 로직
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
      const initialsList = getInitialsList(convertedText);
      return initialsList.some((initials) =>
        initials.includes(searchFilterText),
      );
    }

    return new RegExp(escapeRegExp(searchFilterText), 'i').test(convertedText);
  });
};

// 단어별 초성만 추출한 배열 리턴
const getInitialsList = (text: string): string[] => {
  return text.split(/\s+/).map((word) => {
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

// 단어별 초성에서 검색어와 일치하는 단어 찾기
const findMatchedWordByInitials = (
  text: string,
  initialsToMatch: string,
): string | null => {
  const words = text.split(/\s+/);
  for (const word of words) {
    const initials = getInitialsList(word)[0];
    if (initials.includes(initialsToMatch)) {
      return word;
    }
  }
  return null;
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
