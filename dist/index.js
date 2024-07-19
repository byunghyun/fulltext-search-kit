"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialLetterMatcher = exports.characterPatternCheckerCore = exports.escapeRegExp = exports.fullTextSearchCore = exports.returnFullTextSearchFilteredData = void 0;
var returnFullTextSearchFilteredData = function (_a) {
    var data = _a.data, searchRequirement = _a.searchRequirement, searchFilterText = _a.searchFilterText;
    if (!searchFilterText) {
        return data;
    }
    return data.filter(function (item) {
        return (0, exports.fullTextSearchCore)(item, searchRequirement, searchFilterText);
    });
};
exports.returnFullTextSearchFilteredData = returnFullTextSearchFilteredData;
var fullTextSearchCore = function (dataItem, searchRequirement, searchFilterText) {
    return searchRequirement.some(function (searchItem) {
        if (Array.isArray(dataItem)) {
            var checkRequirements = dataItem.reduce(function (acc, cur) {
                var convertedText = function () {
                    if (cur === null || cur === void 0 ? void 0 : cur.removeCharacters) {
                        return cur[searchItem.value].replaceAll(cur.removeCharacters, '');
                    }
                    return cur[searchItem.value];
                };
                return __spreadArray(__spreadArray([], acc, true), [
                    convertedText().includes(searchFilterText) ||
                        (0, exports.createInitialLetterMatcher)(searchFilterText).test(convertedText()),
                ], false);
            }, []);
            return checkRequirements.includes(true);
        }
        var value = dataItem[searchItem.value];
        var isKorean = /[ㄱ-ㅎ가-힣]/.test(searchFilterText);
        if (isKorean) {
            return (value.includes(searchFilterText) ||
                (0, exports.createInitialLetterMatcher)(searchFilterText).test(value));
        }
        return new RegExp((0, exports.escapeRegExp)(searchFilterText), 'i').test(value);
    });
};
exports.fullTextSearchCore = fullTextSearchCore;
var escapeRegExp = function (string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
exports.escapeRegExp = escapeRegExp;
var charCodeAts = {
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
};
var characterPatternCheckerCore = function (character) {
    var offset = 44032;
    if (/[가-힣]/.test(character)) {
        var chCode = character.charCodeAt(0) - offset;
        if (chCode % 28 > 0) {
            return character;
        }
        var begin = Math.floor(chCode / 28) * 28 + offset;
        var end = begin + 27;
        return "[\\u".concat(begin.toString(16), "-\\u").concat(end.toString(16), "]");
    }
    if (/[ㄱ-ㅎ]/.test(character)) {
        var begin = charCodeAts[character] ||
            (character.charCodeAt(0) - 12613) * 588 + charCodeAts['ㅅ'];
        var end = begin + 587;
        return "[".concat(character, "\\u").concat(begin.toString(16), "-\\u").concat(end.toString(16), "]");
    }
    return (0, exports.escapeRegExp)(character);
};
exports.characterPatternCheckerCore = characterPatternCheckerCore;
var createInitialLetterMatcher = function (searchText) {
    var pattern = searchText
        .split('')
        .map(function (item) { return (0, exports.characterPatternCheckerCore)(item); })
        .join('.*?');
    return new RegExp(pattern);
};
exports.createInitialLetterMatcher = createInitialLetterMatcher;
