export type FullTextSearchRequirement<T> = {
  value: keyof T;
  keywords: string[];
};

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isKorean(char: string) {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(char);
}

function getInitialsListWithSpaces(text: string) {
  const INITIALS = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ];
  const result: string[] = [];
  const positions: number[] = [];

  let offset = 0;

  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const index = Math.floor((code - 0xac00) / 588);
      result.push(INITIALS[index]);
      positions.push(offset);
    } else if (/^[ㄱ-ㅎ]$/.test(char)) {
      result.push(char);
      positions.push(offset);
    }
    offset += char.length;
  }

  return { list: result, positions };
}

function convertToSearchableText(text: string) {
  return text
    .replace(/\s/g, '') // remove spaces
    .normalize('NFC'); // normalize Korean
}

function matchKeyword(text: string, keyword: string) {
  const normalizedText = convertToSearchableText(text);
  const normalizedKeyword = convertToSearchableText(keyword);

  // 기본 완성형 비교
  if (normalizedText.includes(normalizedKeyword)) {
    return true;
  }

  // 초성 fallback
  const initials = getInitialsListWithSpaces(normalizedText).list;
  const keywordChars = Array.from(normalizedKeyword);

  let idx = 0;
  for (const char of keywordChars) {
    if (/^[ㄱ-ㅎ]$/.test(char)) {
      if (initials[idx] !== char) return false;
    } else {
      if (normalizedText[idx] !== char) return false;
    }
    idx++;
  }

  return true;
}

function highlightText(text: string, keyword: string): string {
  const normalizedText = convertToSearchableText(text);
  const normalizedKeyword = convertToSearchableText(keyword);

  const baseMatch = normalizedText.indexOf(normalizedKeyword);
  if (baseMatch !== -1) {
    return (
      text.slice(0, baseMatch) +
      `<mark>${text.slice(baseMatch, baseMatch + keyword.length)}</mark>` +
      text.slice(baseMatch + keyword.length)
    );
  }

  // 초성 fallback highlight
  const { list: initials, positions } =
    getInitialsListWithSpaces(normalizedText);
  const keywordChars = Array.from(normalizedKeyword);

  let matched = true;
  for (let i = 0; i < keywordChars.length; i++) {
    const k = keywordChars[i];
    if (/^[ㄱ-ㅎ]$/.test(k)) {
      if (initials[i] !== k) {
        matched = false;
        break;
      }
    } else {
      if (normalizedText[i] !== k) {
        matched = false;
        break;
      }
    }
  }

  if (!matched) return text;

  const start = positions[0];
  const end = positions[keywordChars.length - 1] + 1;

  return (
    text.slice(0, start) +
    `<mark>${text.slice(start, end)}</mark>` +
    text.slice(end)
  );
}

export function fullTextSearch<T extends { [key: string]: any }>({
  data,
  searchRequirement,
}: {
  data: T[];
  searchRequirement: FullTextSearchRequirement<T>[];
}): T[] {
  if (!data || !searchRequirement?.length) return data;

  return data.filter((item) =>
    searchRequirement.every(({ value, keywords }) => {
      const rawValue = item[value];
      if (!rawValue || !keywords.length) return true;

      return keywords.every((keyword) =>
        matchKeyword(String(rawValue), keyword),
      );
    }),
  );
}

export function getFullTextSearchHighlights<T extends { [key: string]: any }>({
  item,
  searchRequirement,
}: {
  item: T;
  searchRequirement: FullTextSearchRequirement<T>[];
}): Partial<Record<keyof T, string>> {
  const highlights: Partial<Record<keyof T, string>> = {};

  for (const { value, keywords } of searchRequirement) {
    const rawValue = item[value];
    if (!rawValue || !keywords.length) continue;

    const originalText = String(rawValue);

    for (const keyword of keywords) {
      if (matchKeyword(originalText, keyword)) {
        highlights[value] = highlightText(originalText, keyword);
        break;
      }
    }
  }

  return highlights;
}
