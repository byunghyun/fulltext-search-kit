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
    return fullTextSearchCoreLegacy(item, searchRequirement, searchFilterText);
  });
};

// 최신 검색 함수
export const fullTextSearch = <T extends { [Key: string]: any }>({
  data,
  searchRequirement,
}: {
  data: Array<T>;
  searchRequirement: Array<{
    value: string;
    keywords: string[];
    removeCharacters?: string;
  }>;
}) => {
  return data.filter((item) => {
    return fullTextSearchCore(item, searchRequirement);
  });
};

// 레거시 core
const fullTextSearchCoreLegacy = <T extends { [Key: string]: any }>(
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

    const isPureInitial = isPureChosung(searchFilterText);

    if (isPureInitial) {
      const { list } = getInitialsListWithSpaces(convertedText);
      const initialsWithSpace = list.join(' ');
      return initialsWithSpace.includes(searchFilterText);
    }

    return new RegExp(escapeRegExp(searchFilterText), 'i').test(convertedText);
  });
};

// 최신 core (다중 키워드 AND 조건)
const fullTextSearchCore = <T extends { [Key: string]: any }>(
  dataItem: T,
  searchRequirement: Array<{
    value: string;
    keywords: string[];
    removeCharacters?: string;
  }>,
): boolean => {
  return searchRequirement.every((searchItem) => {
    const value = dataItem[searchItem.value];
    if (typeof value !== 'string') return false;

    const keywords = searchItem.keywords?.filter((k) => k.trim() !== '');
    if (!keywords || keywords.length === 0) return true;

    const convertedText = searchItem.removeCharacters
      ? value.replace(
          new RegExp(`[${escapeRegExp(searchItem.removeCharacters)}]`, 'g'),
          '',
        )
      : value;

    return keywords.some((keyword) => {
      const isPureInitial = isPureChosung(keyword);

      if (isPureInitial) {
        const { list } = getInitialsListWithSpaces(convertedText);
        const initialsWithSpace = list.join(' ');
        return initialsWithSpace.includes(keyword);
      }

      return new RegExp(escapeRegExp(keyword), 'i').test(convertedText);
    });
  });
};

// 초성 리스트 생성 (단어 단위 + 띄어쓰기 유지)
const getInitialsListWithSpaces = (text: string): { list: string[] } => {
  const words = text.split(/\s+/);
  const list: string[] = [];

  for (const word of words) {
    const wordInitials: string[] = [];
    for (let char of word) {
      const code = char.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const cho = Math.floor((code - 0xac00) / 588);
        wordInitials.push('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[cho]);
      }
    }
    list.push(wordInitials.join(''));
  }

  return { list };
};

// 초성인지 판단 (정확하게)
const isPureChosung = (str: string): boolean => /^[ㄱ-ㅎ\s]+$/.test(str);

// 정규식 escape 유틸
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
