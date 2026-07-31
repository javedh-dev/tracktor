import { parseCsvPreview, importFuelLogsFromCsv } from '$lib/helper/csv.helper';
import { fuelLogStore } from '$stores/fuel-log.svelte';
import { sheetStore } from '$stores/sheet.svelte';
import { vehicleStore } from '$stores/vehicle.svelte';
import { page } from '$app/state';
import { readVehicleScope } from '$lib/scope/vehicle-scope.svelte';
import { toast } from 'svelte-sonner';
import { parseWithFormat } from '$lib/helper/format.helper';
import { configStore } from '$lib/stores/config.svelte';
import * as m from '$lib/paraglide/messages';

export type FuelLogColumnKey =
  'date' | 'odometer' | 'fuelAmount' | 'cost' | 'filled' | 'missedLast' | 'notes';

export interface ColumnDefinition {
  key: FuelLogColumnKey;
  label: string;
  required: boolean;
  hint?: string;
}

export interface ParsedCsvRow {
  [key: string]: string;
}

export const stepOrder = [1, 2, 3] as const;
export type ImportStep = (typeof stepOrder)[number];

export const columns: ColumnDefinition[] = [
  { key: 'date', label: m.col_date(), required: true, hint: m.fuel_import_col_date_hint() },
  {
    key: 'odometer',
    label: m.col_odometer(),
    required: false,
    hint: m.fuel_import_col_odometer_hint()
  },
  {
    key: 'fuelAmount',
    label: m.col_fuel_amount(),
    required: false,
    hint: m.fuel_import_col_fuel_hint()
  },
  { key: 'cost', label: m.col_cost(), required: true, hint: m.fuel_import_col_cost_hint() },
  {
    key: 'filled',
    label: m.form_full_tank(),
    required: false,
    hint: m.fuel_import_col_filled_hint()
  },
  {
    key: 'missedLast',
    label: m.col_missed_last(),
    required: false,
    hint: m.fuel_import_col_missed_hint()
  },
  { key: 'notes', label: m.col_notes(), required: false, hint: m.fuel_import_col_notes_hint() }
];

export const defaultMapping = (): Record<FuelLogColumnKey, string> => ({
  date: '',
  odometer: '',
  fuelAmount: '',
  cost: '',
  filled: '',
  missedLast: '',
  notes: ''
});

const autoMapHints: Record<FuelLogColumnKey, string[]> = {
  date: ['date', 'refuel date', 'refill date'],
  odometer: ['odo', 'odometer', 'mileage'],
  fuelAmount: ['fuel', 'volume', 'litre', 'liter', 'quantity', 'energy', 'kwh'],
  cost: ['cost', 'price', 'amount', 'total'],
  filled: ['full', 'filled', 'tank'],
  missedLast: ['missed', 'skip', 'skipped'],
  notes: ['note', 'remarks', 'comment', 'description']
};

export const buildAutoMapping = (headers: string[]): Record<FuelLogColumnKey, string> => {
  const next = defaultMapping();
  for (const header of headers) {
    const normalized = header.toLowerCase();
    for (const column of columns) {
      if (next[column.key]) continue;
      if (autoMapHints[column.key].some((hint) => normalized.includes(hint))) {
        next[column.key] = header;
      }
    }
  }
  return next;
};

export class FuelLogImportState {
  step = $state<ImportStep>(1);
  file = $state<File>();
  delimiter = $state(',');
  hasHeaders = $state(true);
  dateFormat = $state(configStore.configs.dateFormat || 'MM/dd/yyyy');
  csvHeaders = $state<string[]>([]);
  csvRows = $state<ParsedCsvRow[]>([]);
  mapping = $state<Record<FuelLogColumnKey, string>>(defaultMapping());
  parseError = $state<string>();
  processing = $state<'idle' | 'parsing' | 'importing'>('idle');

  scopedVehicleId = $derived(readVehicleScope(page.url, vehicleStore.vehicles).vehicleId);

  selectedVehicle = $derived(
    vehicleStore.vehicles?.find((vehicle) => vehicle.id === this.scopedVehicleId)
  );

  selectedVehicleLabel = $derived(
    this.selectedVehicle
      ? `${this.selectedVehicle.make} ${this.selectedVehicle.model} (${this.selectedVehicle.licensePlate})`
      : m.fuel_import_no_vehicle()
  );

  requiredKeys = $derived(columns.filter((c) => c.required).map((c) => c.key));

  mappedPreview = $derived(
    this.csvRows.slice(0, 10).map((row) => {
      const preview: Record<FuelLogColumnKey, string> = {
        date: '',
        odometer: '',
        fuelAmount: '',
        cost: '',
        filled: '',
        missedLast: '',
        notes: ''
      };

      for (const column of columns) {
        const selectedHeader = this.mapping[column.key];
        if (selectedHeader && selectedHeader !== '__skip') {
          preview[column.key] = row[selectedHeader] ?? '';
        }
      }
      return preview;
    })
  );

  mappingValid = $derived(
    this.requiredKeys.every((key) => {
      const value = this.mapping[key];
      return Boolean(value && value !== '__skip');
    })
  );

  canProceedFromUpload = $derived(
    Boolean(this.file) && this.processing === 'idle' && this.dateFormat.trim().length > 0
  );

  canProceedFromMapping = $derived(this.mappingValid && this.processing === 'idle');

  canImport = $derived(this.mappingValid && this.csvRows.length > 0 && this.processing === 'idle');

  dateValidationErrors = $derived(
    (() => {
      const errors: Record<number, string> = {};
      const dateHeader = this.mapping.date;
      if (!dateHeader || dateHeader === '__skip') return errors;

      for (let i = 0; i < Math.min(this.mappedPreview.length, this.csvRows.length); i++) {
        const dateStr = this.csvRows[i][dateHeader];
        if (dateStr && !parseWithFormat(dateStr, this.dateFormat)) {
          errors[i] = m.fuel_import_date_invalid();
        }
      }
      return errors;
    })()
  );

  hasDateErrors = $derived(Object.keys(this.dateValidationErrors).length > 0);

  resetParsedState = () => {
    this.csvHeaders = [];
    this.csvRows = [];
    this.mapping = defaultMapping();
    this.parseError = undefined;
    this.step = 1;
  };

  handleFileChange = (value: File | undefined) => {
    this.file = value;
    this.resetParsedState();
  };

  handleParse = async () => {
    if (!this.file) return;
    this.processing = 'parsing';
    this.parseError = undefined;
    try {
      const parsed = await parseCsvPreview(this.file, {
        delimiter: this.delimiter,
        hasHeaders: this.hasHeaders
      });
      this.csvHeaders = parsed.headers || [];
      this.csvRows = parsed.rows || [];
      if (!this.csvHeaders.length) {
        this.parseError = m.fuel_import_error_no_headers();
        return;
      }
      this.mapping = buildAutoMapping(this.csvHeaders);
      this.step = 2;
    } catch (err: any) {
      this.parseError = err?.message || m.fuel_import_error_generic();
      toast.error(this.parseError ?? m.fuel_import_error_generic());
    } finally {
      this.processing = 'idle';
    }
  };

  goToPreview = () => {
    if (!this.canProceedFromMapping) return;
    this.step = 3;
  };

  handleImport = async () => {
    if (!this.canImport || !this.scopedVehicleId) return;
    this.processing = 'importing';
    try {
      const rowsForImport = this.csvRows.map((row) => {
        const mappedRow: Record<string, string> = {};
        for (const column of columns) {
          const header = this.mapping[column.key];
          if (header && header !== '__skip') {
            mappedRow[column.key] = row[header] ?? '';
          }
        }
        return mappedRow;
      });

      const result = await importFuelLogsFromCsv(
        rowsForImport,
        this.scopedVehicleId,
        this.dateFormat
      );

      if (result.failed === 0) {
        toast.success(m.fuel_import_success({ count: result.imported }));
        sheetStore.closeSheet(() => fuelLogStore.reloadFuelLogs());
      } else {
        const message = m.fuel_import_failed_count({
          imported: result.imported,
          failed: result.failed
        });
        toast.error(message);
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || m.fuel_import_error_generic());
    } finally {
      this.processing = 'idle';
    }
  };
}
