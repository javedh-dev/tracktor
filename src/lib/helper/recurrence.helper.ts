/**
 * Utility functions for handling recurring dates in insurance, PUCC, and reminders
 */

/**
 * Calculate the next occurrence date based on recurrence type and interval
 * @param currentDate - The current/base date
 * @param recurrenceType - Type of recurrence (yearly, monthly, weekly, daily)
 * @param interval - The interval (e.g., every 1 year, every 2 months)
 * @returns The next occurrence date
 */
export function calculateNextOccurrence(
	currentDate: Date,
	recurrenceType: string,
	interval: number = 1
): Date {
	const nextDate = new Date(currentDate);

	switch (recurrenceType) {
		case 'yearly':
			nextDate.setFullYear(nextDate.getFullYear() + interval);
			break;
		case 'monthly':
			nextDate.setMonth(nextDate.getMonth() + interval);
			break;
		case 'weekly':
			nextDate.setDate(nextDate.getDate() + 7 * interval);
			break;
		case 'daily':
			nextDate.setDate(nextDate.getDate() + interval);
			break;
		default:
			// For 'none' or 'no_end', return the same date
			return currentDate;
	}

	return nextDate;
}

/**
 * Check if a date should recur based on recurrence type
 * @param recurrenceType - Type of recurrence
 * @returns true if the date should recur
 */
export function shouldRecur(recurrenceType: string): boolean {
	return ['yearly', 'monthly', 'weekly', 'daily'].includes(recurrenceType);
}

/**
 * Check if recurrence has ended
 * @param currentDate - The current date
 * @param recurrenceEndDate - The end date for recurrence (null means no end)
 * @returns true if recurrence has ended
 */
export function hasRecurrenceEnded(currentDate: Date, recurrenceEndDate: Date | null): boolean {
	if (!recurrenceEndDate) {
		return false;
	}
	return currentDate > recurrenceEndDate;
}

/**
 * Calculate all occurrences between start and end date
 * @param startDate - The start date
 * @param endDate - The end date (can be null for no end)
 * @param recurrenceType - Type of recurrence
 * @param interval - The interval
 * @param maxOccurrences - Maximum number of occurrences to calculate (default 100)
 * @returns Array of occurrence dates
 */
export function calculateOccurrences(
	startDate: Date,
	endDate: Date | null,
	recurrenceType: string,
	interval: number = 1,
	maxOccurrences: number = 100
): Date[] {
	if (!shouldRecur(recurrenceType)) {
		return [startDate];
	}

	const occurrences: Date[] = [startDate];
	let currentDate = new Date(startDate);
	const today = new Date();

	// If no end date, calculate future occurrences up to maxOccurrences or 2 years ahead
	const calculationLimit =
		endDate || new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

	while (occurrences.length < maxOccurrences) {
		currentDate = calculateNextOccurrence(currentDate, recurrenceType, interval);

		if (currentDate > calculationLimit) {
			break;
		}

		occurrences.push(new Date(currentDate));
	}

	return occurrences;
}

/**
 * Get the effective end date based on recurrence type
 * @param endDate - The original end date
 * @param recurrenceType - Type of recurrence
 * @returns The effective end date or null for no end
 */
export function getEffectiveEndDate(endDate: Date, recurrenceType: string): Date | null {
	if (recurrenceType === 'no_end') {
		return null;
	}
	return endDate;
}

/**
 * Format recurrence description for display
 * @param recurrenceType - Type of recurrence
 * @param interval - The interval
 * @returns Human-readable recurrence description
 */
export function formatRecurrenceDescription(recurrenceType: string, interval: number = 1): string {
	if (recurrenceType === 'none') {
		return 'Fixed end date';
	}
	if (recurrenceType === 'no_end') {
		return 'No end date';
	}

	const intervalText = interval === 1 ? '' : `every ${interval} `;
	const periodText = interval === 1 ? recurrenceType.slice(0, -2) : recurrenceType;

	return `Renews ${intervalText}${periodText}`;
}
