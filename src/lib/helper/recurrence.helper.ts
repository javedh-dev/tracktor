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
function calculateNextOccurrence(
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
function shouldRecur(recurrenceType: string): boolean {
  return ['yearly', 'monthly', 'weekly', 'daily'].includes(recurrenceType);
}

/**
 * Calculate the next due date for a recurring item.
 * Returns null when there is no further scheduled occurrence.
 */
export function getNextDueDate(
  baseDate: Date,
  recurrenceType: string,
  interval: number = 1,
  recurrenceEndDate: Date | null = null
): Date | null {
  // Fixed date: return the base date as the only due date. Perpetual coverage has no next due date.
  if (recurrenceType === 'none') {
    return baseDate;
  }
  if (recurrenceType === 'no_end') {
    return null;
  }

  if (!shouldRecur(recurrenceType)) {
    return null;
  }

  const today = new Date();
  let nextDate = calculateNextOccurrence(baseDate, recurrenceType, interval);

  // Advance until the next future occurrence (if any)
  while (nextDate <= today) {
    nextDate = calculateNextOccurrence(nextDate, recurrenceType, interval);
    if (recurrenceEndDate && nextDate > recurrenceEndDate) {
      return null;
    }
  }

  if (recurrenceEndDate && nextDate > recurrenceEndDate) {
    return null;
  }

  return nextDate;
}
