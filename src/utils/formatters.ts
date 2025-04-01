/**
 * Formats a date object or ISO string into a localized date string (e.g., "2023-10-27").
 * @param date - The Date object or ISO date string.
 * @param options - Optional Intl.DateTimeFormat options.
 * @param locale - Optional locale string (e.g., 'en-US', 'zh-CN'). Defaults to system locale.
 * @returns Formatted date string, or an empty string if input is invalid.
 */
export const formatDate = (
    date: Date | string | null | undefined,
    options?: Intl.DateTimeFormatOptions,
    locale?: string
): string => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        // Check if dateObj is valid
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        };
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    } catch (error) {
        console.error('[Formatter] Error formatting date:', error);
        return '';
    }
};

/**
 * Formats a date object or ISO string into a localized time string (e.g., "14:30").
 * @param date - The Date object or ISO date string.
 * @param options - Optional Intl.DateTimeFormat options.
 * @param locale - Optional locale string. Defaults to system locale.
 * @returns Formatted time string, or an empty string if input is invalid.
 */
export const formatTime = (
    date: Date | string | null | undefined,
    options?: Intl.DateTimeFormatOptions,
    locale?: string
): string => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            // hour12: false, // Optional: use 24-hour format
        };
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    } catch (error) {
        console.error('[Formatter] Error formatting time:', error);
        return '';
    }
};

/**
 * Formats a date object or ISO string into a localized date and time string.
 * @param date - The Date object or ISO date string.
 * @param options - Optional Intl.DateTimeFormat options.
 * @param locale - Optional locale string. Defaults to system locale.
 * @returns Formatted date-time string, or an empty string if input is invalid.
 */
export const formatDateTime = (
    date: Date | string | null | undefined,
    options?: Intl.DateTimeFormatOptions,
    locale?: string
): string => {
    if (!date) return '';
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return '';

        const defaultOptions: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        };
        return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
    } catch (error) {
        console.error('[Formatter] Error formatting date-time:', error);
        return '';
    }
};

/**
 * Formats a number as currency according to locale rules.
 * @param amount - The numeric amount.
 * @param currencyCode - The ISO 4217 currency code (e.g., 'USD', 'EUR', 'CNY').
 * @param options - Optional Intl.NumberFormat options.
 * @param locale - Optional locale string. Defaults to system locale.
 * @returns Formatted currency string, or an empty string if input is invalid.
 */
export const formatCurrency = (
    amount: number | null | undefined,
    currencyCode: string,
    options?: Intl.NumberFormatOptions,
    locale?: string
): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return '';
    try {
        const defaultOptions: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currencyCode,
            // minimumFractionDigits: 2, // Optional: enforce decimals
            // maximumFractionDigits: 2,
        };
        return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(amount);
    } catch (error) {
        console.error('[Formatter] Error formatting currency:', error);
        return '';
    }
};


/**
 * Truncates a string to a maximum length and adds ellipsis if needed.
 * @param text - The string to truncate.
 * @param maxLength - The maximum allowed length.
 * @returns The truncated string (or original if shorter).
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

// NOTE: For more complex relative time formatting (e.g., "2 hours ago", "in 3 days"),
// consider using a dedicated library like `date-fns` (`formatDistanceToNow`, `formatRelative`).
// Example: import { formatDistanceToNow } from 'date-fns';
//          import { zhCN } from 'date-fns/locale';
//          formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });

// Example Usage:
// import { formatDate, formatCurrency } from './utils/formatters';
//
// const isoDate = '2023-10-27T10:30:00Z';
// const amount = 1234.56;
//
// const displayDate = formatDate(isoDate); // "10/27/2023" (depends on default locale)
// const displayDateCN = formatDate(isoDate, undefined, 'zh-CN'); // "2023/10/27"
// const displayTime = formatTime(isoDate); // "10:30 AM" (depends on locale)
// const displayCurrency = formatCurrency(amount, 'CNY', undefined, 'zh-CN'); // "¥1,234.56"