// Chase-New util — core filter functions
// All filters are pure functions, RE2-compatible where regex is used.
// Passed as second argument to tpl.render(data, util).
const HTML_MAP = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&apos;', '"': '&quot;',
};
const htmlEscape = (s) => !s || typeof s !== 'string' ? s : s.replace(/[&<>'"]/g, c => HTML_MAP[c] ?? c);
// ── Strings ──────────────────────────────────────────────────────────────────
const upper = (s) => typeof s === 'string' ? s.toUpperCase() : s;
const lower = (s) => typeof s === 'string' ? s.toLowerCase() : s;
const capitalize = (s) => typeof s === 'string' && s.length > 0 ? (s[0]?.toUpperCase() ?? '') + s.slice(1) : s;
const trim = (s) => typeof s === 'string' ? s.trim() : s;
const truncate = (s, n, suffix = '…') => typeof s === 'string' && s.length > n ? s.slice(0, n) + suffix : s;
const replace = (s, from, to) => typeof s === 'string' ? s.split(from).join(to) : s;
const striptags = (s) => typeof s === 'string' ? s.replace(/<[^>]*>/g, '') : s;
const slugify = (s) => typeof s !== 'string' ? s : s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
// ISO 8601 timestamp: "2024-01-15" → "2024-01-15T00:00:00.000Z"
const isoDate = (s) => {
    if (!s)
        return s;
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toISOString();
};
// Date formatter.
// locale (BCP-47 like 'de-DE', 'en-US'):  toLocaleDateString with long options
//   → "Montag, 15. Januar 2024"
// pattern ('yyyy-MM-dd', 'dd.MM.yyyy', …): token replacement
//   tokens: yyyy MM dd HH mm ss
const dateFormat = (s, fmt) => {
    if (!s)
        return s;
    const d = new Date(s);
    if (isNaN(d.getTime()))
        return s;
    // Locale detection: 2-3 letter language tag, optional region subtag
    if (/^[a-z]{2,3}(-[A-Z]{2,3})?$/.test(fmt)) {
        return d.toLocaleDateString(fmt, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    return fmt
        .replaceAll('yyyy', String(d.getFullYear()))
        .replaceAll('MM', String(d.getMonth() + 1).padStart(2, '0'))
        .replaceAll('dd', String(d.getDate()).padStart(2, '0'))
        .replaceAll('HH', String(d.getHours()).padStart(2, '0'))
        .replaceAll('mm', String(d.getMinutes()).padStart(2, '0'))
        .replaceAll('ss', String(d.getSeconds()).padStart(2, '0'));
};
// Compact date: day + long month name, locale-aware → "11. Juli" / "11 July"
const dateShort = (s, locale) => {
    if (!s)
        return s;
    const d = new Date(s);
    if (isNaN(d.getTime()))
        return s;
    return d.toLocaleDateString(locale || 'de', { day: 'numeric', month: 'long' });
};
// Day of month as string → "14"
const dateDay = (s) => {
    if (!s)
        return s;
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : String(d.getDate());
};
// Short month name without trailing period → "Jul", "Sep", "Mär"
const dateMonthShort = (s, locale) => {
    if (!s)
        return s;
    const d = new Date(s);
    if (isNaN(d.getTime()))
        return s;
    return d.toLocaleDateString(locale || 'de', { month: 'short' }).replace(/\.$/, '');
};
// ── Arrays ───────────────────────────────────────────────────────────────────
const join = (arr, sep = ', ') => Array.isArray(arr) ? arr.join(sep) : String(arr);
const first = (arr) => Array.isArray(arr) ? arr[0] : undefined;
const last = (arr) => Array.isArray(arr) ? arr[arr.length - 1] : undefined;
const length = (val) => Array.isArray(val) || typeof val === 'string' ? val.length : 0;
// ── Numbers ──────────────────────────────────────────────────────────────────
const round = (n, decimals = 0) => {
    if (typeof n !== 'number')
        return n;
    const factor = Math.pow(10, decimals);
    return Math.round(n * factor) / factor;
};
const number = (n, locale = 'de-DE') => typeof n === 'number' ? n.toLocaleString(locale) : String(n);
// ── stripWhitespace (for strip: true option) ─────────────────────────────────
export const stripWhitespace = (val) => !val || typeof val !== 'string'
    ? val
    : val
        .replace(/\n/g, '')
        .replace(/[\t ]+</g, '<')
        .replace(/>[\t ]+</g, '><')
        .replace(/>[\t ]+$/g, '>');
// ── Export ───────────────────────────────────────────────────────────────────
const util = {
    // Strings
    upper, lower, capitalize, trim, truncate, replace, striptags, slugify, isoDate, dateFormat, dateShort, dateDay, dateMonthShort,
    // Arrays
    join, first, last, length,
    // Numbers
    round, number,
    // Internal (used by strip option, not a user-facing pipe filter)
    stripWhitespace,
};
export default util;
//# sourceMappingURL=util.js.map