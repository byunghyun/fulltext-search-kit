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

// 최신 fullTextSearch (권장)
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

// 레거시 검색 로직 (단일 텍스트)
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

    const isKorean = /[ㄱ-ㅎ가-힣]/.test(searchFilterText);
    if (isKorean) {
      const { list, joined } = getInitialsListAndJoined(convertedText);
      return (
        list.some((initials) => initials.includes(searchFilterText)) ||
        joined.includes(searchFilterText)
      );
    }

    return new RegExp(escapeRegExp(searchFilterText), 'i').test(convertedText);
  });
};

// 최신 검색 로직 (다중 키워드)
const fullTextSearchCore = <T extends { [Key: string]: any }>(
  dataItem: T,
  searchRequirement: Array<{
    value: string;
    keywords: string[];
    removeCharacters?: string;
  }>,
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

    return searchItem.keywords.some((keyword) => {
      const isKorean = /[ㄱ-ㅎ가-힣]/.test(keyword);

      if (isKorean) {
        const { list, joined } = getInitialsListAndJoined(convertedText);
        return (
          list.some((initials) => initials.includes(keyword)) ||
          joined.includes(keyword)
        );
      }

      return new RegExp(escapeRegExp(keyword), 'i').test(convertedText);
    });
  });
};

// 초성 추출 유틸
const getInitialsListAndJoined = (
  text: string,
): { list: string[]; joined: string } => {
  const words = text.split(/\s+/);
  const list: string[] = [];
  const initials: string[] = [];

  for (const word of words) {
    const wordInitials: string[] = [];
    for (let char of word) {
      const code = char.charCodeAt(0);
      if (code >= 0xac00 && code <= 0xd7a3) {
        const cho = Math.floor((code - 0xac00) / 588);
        wordInitials.push('ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[cho]);
      }
    }
    const joined = wordInitials.join('');
    list.push(joined);
    initials.push(...wordInitials);
  }

  return { list, joined: initials.join('') };
};

// 정규식 이스케이프
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
