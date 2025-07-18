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
  if (!searchFilterText) return data;

  return data.filter((item) =>
    searchRequirement.some((req) => {
      const value = item[req.value];
      if (typeof value !== 'string') return false;

      const converted = req.removeCharacters
        ? value.replace(
            new RegExp(`[${escapeRegExp(req.removeCharacters)}]`, 'g'),
            '',
          )
        : value;

      const textMatched = new RegExp(escapeRegExp(searchFilterText), 'i').test(
        converted,
      );
      if (textMatched) return true;

      const isPureInitial = isChosungOnly(searchFilterText);
      if (isPureInitial) {
        const { list } = getInitialsListWithSpaces(converted);
        return list.join(' ').includes(searchFilterText);
      }

      return false;
    }),
  );
};

// 최신 검색 (다중 필드 AND 조건)
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
  return data.filter((item) => fullTextSearchCore(item, searchRequirement));
};

// 하이라이팅 포함 버전
export const fullTextSearchWithHighlight = <T extends { [Key: string]: any }>({
  data,
  searchRequirement,
}: {
  data: Array<T>;
  searchRequirement: Array<{
    value: string;
    keywords: string[];
    removeCharacters?: string;
  }>;
}): Array<{ item: T; highlights: Partial<Record<keyof T, string>> }> => {
  return data
    .map((item) => {
      let matched = false;
      const highlights: Partial<Record<keyof T, string>> = {};

      for (const req of searchRequirement) {
        const key = req.value as keyof T;
        const raw = item[key];
        if (typeof raw !== 'string') continue;

        const converted = req.removeCharacters
          ? raw.replace(
              new RegExp(`[${escapeRegExp(req.removeCharacters)}]`, 'g'),
              '',
            )
          : raw;

        for (const keyword of req.keywords) {
          if (!keyword.trim()) continue;

          // 일반 문자열 우선
          const regex = new RegExp(escapeRegExp(keyword), 'gi');
          if (regex.test(converted)) {
            matched = true;
            highlights[key] = raw.replace(
              regex,
              (m: string) => `<mark>${m}</mark>`,
            );
            break;
          }

          // 초성 fallback
          if (isChosungOnly(keyword)) {
            const { list } = getInitialsListWithSpaces(converted);
            const initialStr = list.join(' ');
            if (initialStr.includes(keyword)) {
              matched = true;
              highlights[key] = raw; // 따로 강조할 방법은 없음 (초성 매치라서)
              break;
            }
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

// 핵심 로직 (AND)
const fullTextSearchCore = <T extends { [Key: string]: any }>(
  dataItem: T,
  searchRequirement: Array<{
    value: string;
    keywords: string[];
    removeCharacters?: string;
  }>,
): boolean => {
  return searchRequirement.every((req) => {
    const value = dataItem[req.value];
    if (typeof value !== 'string') return false;

    const keywords = req.keywords?.filter((k) => k.trim());
    if (!keywords.length) return true;

    const converted = req.removeCharacters
      ? value.replace(
          new RegExp(`[${escapeRegExp(req.removeCharacters)}]`, 'g'),
          '',
        )
      : value;

    return keywords.some((keyword) => {
      const textMatched = new RegExp(escapeRegExp(keyword), 'i').test(
        converted,
      );
      if (textMatched) return true;

      const isPureInitial = isChosungOnly(keyword);
      if (isPureInitial) {
        const { list } = getInitialsListWithSpaces(converted);
        return list.join(' ').includes(keyword);
      }

      return false;
    });
  });
};

// 초성만으로 이루어졌는지 판단
const isChosungOnly = (str: string): boolean => /^[ㄱ-ㅎ\s]+$/.test(str);

// 단어별 초성 리스트 반환
const getInitialsListWithSpaces = (text: string): { list: string[] } => {
  const words = text.split(/\s+/);
  return {
    list: words.map((word) =>
      [...word]
        .map((char) => {
          const code = char.charCodeAt(0);
          if (code >= 0xac00 && code <= 0xd7a3) {
            const cho = Math.floor((code - 0xac00) / 588);
            return 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'[cho];
          }
          return '';
        })
        .join(''),
    ),
  };
};

// 정규식 이스케이프
const escapeRegExp = (string: string) =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
