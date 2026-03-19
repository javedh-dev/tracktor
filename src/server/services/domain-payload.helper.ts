type RecurringPayload = {
  recurrenceType?: string;
  endDate?: string | null;
  expiryDate?: string | null;
};

export function clearFixedEndDate<T extends RecurringPayload>(payload: T): T {
  if (payload.recurrenceType === 'none') {
    return payload;
  }

  const clearedPayload = { ...payload };

  if ('endDate' in clearedPayload) {
    clearedPayload.endDate = null;
  }

  if ('expiryDate' in clearedPayload) {
    clearedPayload.expiryDate = null;
  }

  return clearedPayload;
}
