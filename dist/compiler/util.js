export const isFilterMap = (value) => typeof value === 'object' && value !== null && Object.values(value).every(item => typeof item === 'function');
//# sourceMappingURL=util.js.map