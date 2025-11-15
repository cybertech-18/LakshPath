"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeParse = exports.safeStringify = void 0;
const safeStringify = (data) => {
    try {
        return JSON.stringify(data ?? {});
    }
    catch (error) {
        console.warn('Failed to stringify JSON payload', error);
        return '{}';
    }
};
exports.safeStringify = safeStringify;
const safeParse = (value, fallback = []) => {
    if (!value)
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch (error) {
        console.warn('Failed to parse JSON column', error);
        return fallback;
    }
};
exports.safeParse = safeParse;
