import LabelWithIcon from '$appui/LabelWithIcon.svelte';
import { Badge } from '$lib/components/ui/badge';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { formatCurrency, formatDate, formatDistance, formatVolume } from '$helper/formatting';
import {
	Banknote,
	Calendar1,
	CircleGauge,
	Fuel,
	Notebook,
	PaintBucket,
	SkipBack
} from '@lucide/svelte/icons';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';
import FuelLogContextMenu from '$lib/components/features/fuel/FuelLogContextMenu.svelte';

export interface NewFuelLog {
	date: string;
	odometer: number | null;
	fuelAmount: number | null;
	cost: number | null;
	notes?: string;
}

export interface FuelLog {
	id: string;
	date: string;
	odometer: number;
	fuelAmount: number;
	cost: number;
	notes?: string;
	mileage?: number;
	filled?: boolean;
	missedLast?: boolean;
	vehicleId: string;
}
