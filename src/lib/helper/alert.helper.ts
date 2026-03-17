import type { Insurance, PollutionCertificate } from '$lib/domain';
import { differenceInDays } from 'date-fns';
import * as m from '$lib/paraglide/messages';

export type VehicleAlertType = 'insurance' | 'pucc';
export type VehicleAlertStatus = 'expired' | 'expiring' | 'valid' | 'missing';

export interface VehicleAlert {
  type: VehicleAlertType;
  status: VehicleAlertStatus;
  title: string;
  message: string;
  daysRemaining: number;
  expiryDate: Date | null;
  hasRecord: boolean;
}

const ALERT_THRESHOLD_DAYS = 30;

const classifyStatus = (daysRemaining: number): VehicleAlertStatus => {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining <= ALERT_THRESHOLD_DAYS) return 'expiring';
  return 'valid';
};

const formatMessage = (type: VehicleAlertType, status: VehicleAlertStatus, days: number) => {
  const label = type === 'insurance' ? m.alert_type_insurance() : m.alert_type_pucc();
  if (status === 'expired') {
    return m.alert_status_expired_ago({ label, days: Math.abs(days) });
  }
  if (status === 'expiring') {
    return m.alert_status_expires_in({ label, days });
  }
  return m.alert_status_valid_for({ label, days });
};

const buildAlert = (type: VehicleAlertType, expiryDate: Date): VehicleAlert => {
  const today = new Date();
  const daysRemaining = differenceInDays(expiryDate, today);
  const status = classifyStatus(daysRemaining);

  return {
    type,
    status,
    title: type === 'insurance' ? m.alert_type_insurance() : m.alert_type_pucc(),
    message: formatMessage(type, status, daysRemaining),
    daysRemaining,
    expiryDate,
    hasRecord: true
  };
};

const buildMissingAlert = (type: VehicleAlertType): VehicleAlert => {
  const label = type === 'insurance' ? 'Insurance' : 'PUCC';
  return {
    type,
    status: 'missing',
    title: type === 'insurance' ? m.alert_type_insurance() : m.alert_type_pucc(),
    message: m.alert_record_not_found({ label }),
    daysRemaining: Number.POSITIVE_INFINITY,
    expiryDate: null,
    hasRecord: false
  };
};

export const calculateInsuranceAlert = (insurances?: Insurance[] | null): VehicleAlert | null => {
  if (!insurances || insurances.length === 0) return buildMissingAlert('insurance');

  const perpetual = insurances.find(
    (insurance) => !insurance.endDate || insurance.recurrenceType === 'no_end'
  );
  if (perpetual) {
    return {
      type: 'insurance',
      status: 'valid',
      title: m.alert_type_insurance(),
      message: m.alert_insurance_active_no_end(),
      daysRemaining: Number.POSITIVE_INFINITY,
      expiryDate: null,
      hasRecord: true
    };
  }

  const latest = insurances.reduce((latest, current) => {
    return new Date(current.endDate!) > new Date(latest.endDate!) ? current : latest;
  });
  return buildAlert('insurance', new Date(latest.endDate!));
};

export const calculatePuccAlert = (
  certificates?: PollutionCertificate[] | null
): VehicleAlert | null => {
  if (!certificates || certificates.length === 0) return buildMissingAlert('pucc');

  const perpetual = certificates.find(
    (certificate) => !certificate.expiryDate || certificate.recurrenceType === 'no_end'
  );
  if (perpetual) {
    return {
      type: 'pucc',
      status: 'valid',
      title: m.alert_type_pucc(),
      message: m.alert_pucc_active_no_end(),
      daysRemaining: Number.POSITIVE_INFINITY,
      expiryDate: null,
      hasRecord: true
    };
  }

  const latest = certificates.reduce((latest, current) => {
    return new Date(current.expiryDate!) > new Date(latest.expiryDate!) ? current : latest;
  });
  return buildAlert('pucc', new Date(latest.expiryDate!));
};

export const calculateVehicleAlerts = (
  insurances?: Insurance[] | null,
  certificates?: PollutionCertificate[] | null
): VehicleAlert[] => {
  return [calculateInsuranceAlert(insurances), calculatePuccAlert(certificates)].filter(
    (alert): alert is VehicleAlert => Boolean(alert)
  );
};
