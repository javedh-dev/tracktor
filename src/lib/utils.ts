import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { base } from '$app/paths';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Construct a URL path with the application base URL
 * Useful when making API calls or navigating to routes when the app is hosted under a sub-path
 * When BASE_URL="/tracktor"
 * withBase('/api/vehicles') -> returns "/tracktor/api/vehicles"
 * withBase('/dashboard') -> returns "/tracktor/dashboard"
 */
export function withBase(path: string): string {
	// Remove leading slash from path if base already has trailing slash
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${base}${normalizedPath}`;
}

export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;

export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
/**
 * List of languages that use RTL (Right-to-Left) direction
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi'];

/**
 * Check if a given language uses RTL direction
 * @param locale - Language/locale code (e.g., 'ar', 'en')
 * @returns true if the language is RTL
 */
export function isRtlLanguage(locale: string): boolean {
	return RTL_LANGUAGES.includes(locale.toLowerCase().split('-')[0]);
}

/**
 * Get the text direction for a given language
 */
export function getTextDirection(locale: string): 'rtl' | 'ltr' {
	return isRtlLanguage(locale) ? 'rtl' : 'ltr';
}
