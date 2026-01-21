// Stub helpers for CSV import flows. Implement the real parsing and persistence logic here.
export type CsvParseOptions = {
	delimiter: string;
	hasHeaders: boolean;
};

export type ParsedCsvRow = Record<string, string>;

export type ParsedCsv = {
	headers: string[];
	rows: ParsedCsvRow[];
};

export const parseCsvPreview = async (file: File, options: CsvParseOptions): Promise<ParsedCsv> => {
	const delimiter = options.delimiter === '\\t' ? '\t' : options.delimiter;
	const csvText = await file.text();

	try {
		// Use the browser-friendly sync parser to avoid Buffer usage in the client bundle.
		const { parse } = await import('csv-parse/browser/esm/sync');

		// When headers exist, let csv-parse build objects keyed by header names.
		if (options.hasHeaders) {
			const records = parse(csvText, {
				columns: true,
				delimiter,
				skip_empty_lines: true,
				trim: true,
				bom: true
			}) as ParsedCsvRow[];

			const headers = records.length ? Object.keys(records[0]) : [];
			return { headers, rows: records };
		}

		// Without headers, parse rows as arrays and synthesize column names.
		const arrayRecords = parse(csvText, {
			columns: false,
			delimiter,
			skip_empty_lines: true,
			trim: true,
			bom: true
		}) as string[][];

		const longestRow = arrayRecords.reduce((len, row) => Math.max(len, row.length), 0);
		const headers = Array.from({ length: longestRow }, (_, idx) => `column_${idx + 1}`);
		const rows: ParsedCsvRow[] = arrayRecords.map((row) => {
			const obj: ParsedCsvRow = {};
			headers.forEach((header, idx) => {
				obj[header] = row[idx] ?? '';
			});
			return obj;
		});

		return { headers, rows };
	} catch (err: any) {
		console.error('Failed to parse CSV', err);
		throw new Error(err?.message || 'Failed to parse CSV file.');
	}
};

export const importFuelLogsFromCsv = async (
	rows: ParsedCsvRow[],
	vehicleId: string,
	dateFormat: string
): Promise<{ imported: number; failed: number; errors: string[] }> => {
	// Simulate delay for demo purposes
	await new Promise((resolve) => setTimeout(resolve, 200000));
	const { parseWithFormat } = await import('$lib/helper/format.helper');
	const { saveFuelLog } = await import('$lib/services/fuel.service');
	const { parseDate } = await import('$lib/helper/format.helper');

	const result = { imported: 0, failed: 0, errors: [] as string[] };

	for (let i = 0; i < rows.length; i++) {
		const row = rows[i];

		try {
			// Parse and validate required fields
			const dateStr = row.date?.trim();
			if (!dateStr) {
				throw new Error(`Row ${i + 1}: Date is required`);
			}

			const parsedDate = parseWithFormat(dateStr, dateFormat);
			if (!parsedDate) {
				throw new Error(`Row ${i + 1}: Invalid date "${dateStr}" for format "${dateFormat}"`);
			}

			const odometerStr = row.odometer?.trim();
			const odometer = odometerStr ? Number(odometerStr) : null;
			if (odometer === null || isNaN(odometer)) {
				throw new Error(`Row ${i + 1}: Odometer must be a valid number`);
			}

			const fuelAmountStr = row.fuelAmount?.trim();
			const fuelAmount = fuelAmountStr ? Number(fuelAmountStr) : null;
			if (fuelAmount === null || isNaN(fuelAmount)) {
				throw new Error(`Row ${i + 1}: Fuel Amount must be a valid number`);
			}

			const costStr = row.cost?.trim();
			const cost = costStr ? Number(costStr) : null;
			if (cost === null || isNaN(cost)) {
				throw new Error(`Row ${i + 1}: Cost must be a valid number`);
			}

			// Parse optional boolean fields
			const filledStr = row.filled?.toLowerCase().trim();
			const filled =
				filledStr === 'true' ||
				filledStr === '1' ||
				filledStr === 'yes' ||
				filledStr === 'y' ||
				false;

			const missedLastStr = row.missedLast?.toLowerCase().trim();
			const missedLast =
				missedLastStr === 'true' ||
				missedLastStr === '1' ||
				missedLastStr === 'yes' ||
				missedLastStr === 'y' ||
				false;

			const notes = row.notes?.trim() || null;

			// Build fuel log object
			const fuelLog = {
				id: null,
				vehicleId,
				date: parsedDate,
				odometer,
				fuelAmount,
				cost,
				filled,
				missedLast,
				notes,
				attachment: null
			};

			// Save to database
			const response = await saveFuelLog(fuelLog);
			if (response.status === 'OK') {
				result.imported++;
			} else {
				result.failed++;
				result.errors.push(response.error || `Row ${i + 1}: Unknown error`);
			}
		} catch (err: any) {
			result.failed++;
			result.errors.push(err?.message || `Row ${i + 1}: Import failed`);
		}
	}
	return result;
};
