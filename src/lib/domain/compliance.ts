import { z } from 'zod';
import type { Component } from 'svelte';
import Shield from '@lucide/svelte/icons/shield';
import Leaf from '@lucide/svelte/icons/leaf';
import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
import FileText from '@lucide/svelte/icons/file-text';
import Shapes from '@lucide/svelte/icons/shapes';
import {
  apiDateString,
  dateStringForFormat,
  optionalApiDateString,
  optionalDateStringForFormat
} from './shared';
import { parseWithFormat } from '$lib/helper/date.helper';
import { getNextDueDate } from '$lib/helper/recurrence.helper';

/**
 * Generic categories covering compliance schemes worldwide: emissions testing (India PUCC, US
 * smog check), roadworthiness/safety inspection (EU MOT, Germany TÜV, Australia roadworthy,
 * NZ WoF), plus universal insurance and registration/road-tax renewal. `other` + `otherLabel`
 * covers anything not fitting those buckets rather than enumerating every regional scheme.
 */
export const COMPLIANCE_TYPES = {
  insurance: 'insurance',
  emissions: 'emissions',
  roadworthiness: 'roadworthiness',
  registration: 'registration',
  other: 'other'
} as const;

export type ComplianceType = keyof typeof COMPLIANCE_TYPES;

const COMPLIANCE_TYPE_ICONS: Record<ComplianceType, Component<{ class?: string }>> = {
  insurance: Shield,
  emissions: Leaf,
  roadworthiness: ClipboardCheck,
  registration: FileText,
  other: Shapes
};

export function getComplianceTypeIcon(type: string): Component<{ class?: string }> {
  return COMPLIANCE_TYPE_ICONS[type as ComplianceType] ?? Shapes;
}

export const COMPLIANCE_RECURRENCE_TYPES = {
  none: 'none',
  yearly: 'yearly',
  monthly: 'monthly',
  no_end: 'no_end'
} as const;

export function getComplianceRecurrenceTypeLabel(type: string, m: any): string {
  switch (type) {
    case 'none':
      return m.compliance_recurrence_type_fixed();
    case 'yearly':
      return m.compliance_recurrence_type_yearly();
    case 'monthly':
      return m.compliance_recurrence_type_monthly();
    case 'no_end':
      return m.compliance_recurrence_type_no_end();
    default:
      return m.compliance_recurrence_type_fixed();
  }
}

export function getComplianceTypeLabel(type: string, m: any): string {
  switch (type) {
    case 'insurance':
      return m.compliance_type_insurance();
    case 'emissions':
      return m.compliance_type_emissions();
    case 'roadworthiness':
      return m.compliance_type_roadworthiness();
    case 'registration':
      return m.compliance_type_registration();
    case 'other':
      return m.compliance_type_other();
    default:
      return m.compliance_type_other();
  }
}

/** Label for the document/policy/certificate number field, tailored per type. */
export function getComplianceDocumentNumberLabel(type: string, m: any): string {
  switch (type) {
    case 'insurance':
      return m.compliance_field_policy_number();
    case 'emissions':
    case 'roadworthiness':
      return m.compliance_field_certificate_number();
    case 'registration':
      return m.compliance_field_registration_number();
    default:
      return m.compliance_field_document_number();
  }
}

/** Label for the issuer field (provider/testing center/authority), tailored per type. */
export function getComplianceIssuerLabel(type: string, m: any): string {
  switch (type) {
    case 'insurance':
      return m.compliance_field_provider();
    case 'emissions':
      return m.compliance_field_testing_center();
    case 'roadworthiness':
      return m.compliance_field_inspection_center();
    default:
      return m.compliance_field_issuing_authority();
  }
}

export interface Compliance {
  id: string | null;
  vehicleId: string;
  type: ComplianceType;
  otherLabel: string | null;
  documentNumber: string;
  issuer: string;
  startDate: Date;
  endDate: Date | null;
  recurrenceType: keyof typeof COMPLIANCE_RECURRENCE_TYPES;
  recurrenceInterval: number;
  cost: number | null;
  notes: string | null;
  attachment: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
}

export type ComplianceStatus = 'valid' | 'expiring_soon' | 'expired';

/** Next date this document is due (start/end + recurrence). Null when it never expires. */
export function getComplianceNextDue(doc: Compliance): Date | null {
  const baseDate = doc.endDate ?? doc.startDate;
  if (!baseDate) return null;
  if (doc.recurrenceType === 'no_end') return null;
  if (doc.recurrenceType === 'none') return new Date(baseDate);
  return getNextDueDate(new Date(baseDate), doc.recurrenceType, doc.recurrenceInterval);
}

/** Compliance status derived from the next due date, using the same 30-day "expiring soon" window. */
export function getComplianceStatus(doc: Compliance, today: Date = new Date()): ComplianceStatus {
  const nextDue = getComplianceNextDue(doc);
  if (!nextDue) return 'valid';
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (nextDue < today) return 'expired';
  if (nextDue <= thirtyDaysFromNow) return 'expiring_soon';
  return 'valid';
}

const complianceTypeOptions = Object.keys(COMPLIANCE_TYPES) as [
  ComplianceType,
  ...ComplianceType[]
];

const complianceRecurrenceOptions = Object.keys(
  COMPLIANCE_RECURRENCE_TYPES
) as (keyof typeof COMPLIANCE_RECURRENCE_TYPES)[];

export const complianceSchema = z
  .object({
    id: z.string().nullable(),
    vehicleId: z.uuid(),
    type: z.enum(complianceTypeOptions).default('insurance'),
    otherLabel: z.string().max(100, 'It must be less than 100 characters.').nullable().optional(),
    documentNumber: z
      .string()
      .min(2, 'It must be more than 1 character.')
      .max(50, 'It must be less than 50 characters.'),
    issuer: z
      .string()
      .min(2, 'It must be more than 1 character.')
      .max(100, 'It must be less than 100 characters.'),
    startDate: apiDateString,
    endDate: optionalApiDateString,
    recurrenceType: z
      .enum(
        complianceRecurrenceOptions as [
          keyof typeof COMPLIANCE_RECURRENCE_TYPES,
          ...Array<keyof typeof COMPLIANCE_RECURRENCE_TYPES>
        ]
      )
      .default('none'),
    recurrenceInterval: z.number().int().positive().default(1),
    cost: z.float32().nonnegative().nullable().optional(),
    notes: z.string().nullable(),
    attachment: z.string().nullable()
  })
  .refine(
    (data) => {
      if (data.type !== 'other') return true;
      return !!data.otherLabel && data.otherLabel.trim().length > 0;
    },
    { message: 'Please name the compliance type', path: ['otherLabel'] }
  )
  .refine(
    (data) => {
      if (data.recurrenceType === undefined) return true;
      if (data.recurrenceType !== 'none') return true;
      if (data.endDate === undefined) return true;
      if (!data.endDate) return false;
      if (!data.startDate) return true;
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      // Field-level form validation handles localized values; this comparison
      // is for ISO API values only.
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return true;
      return endDate > startDate;
    },
    { message: 'End date must be after start date when recurrence is fixed' }
  );

export type ComplianceSchema = typeof complianceSchema;

export const complianceFormSchema = (dateFormat: string) =>
  complianceSchema
    .safeExtend({
      startDate: dateStringForFormat(dateFormat),
      endDate: optionalDateStringForFormat(dateFormat)
    })
    .refine(
      (data) => {
        if (data.recurrenceType !== 'none' || !data.startDate || !data.endDate) return true;
        const startDate = parseWithFormat(data.startDate, dateFormat);
        const endDate = parseWithFormat(data.endDate, dateFormat);
        return !!startDate && !!endDate && endDate > startDate;
      },
      { message: 'End date must be after start date when recurrence is fixed' }
    );
