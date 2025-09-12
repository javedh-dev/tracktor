import LabelWithIcon from '$lib/components/custom/common/LabelWithIcon.svelte';
import { Badge } from '$lib/components/ui/badge';
import { renderComponent, renderSnippet } from '$lib/components/ui/data-table';
import { formatCurrency, formatDate, formatDistance, formatVolume } from '$utils/formatting';
import {
	Banknote,
	Calendar1,
	Fuel,
	GaugeCircle,
	Notebook,
	PaintBucket,
	SkipBack
} from '@lucide/svelte';
import type { ColumnDef } from '@tanstack/table-core';
import { createRawSnippet } from 'svelte';

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
}

export const columns: ColumnDef<FuelLog>[] = [
	{
		accessorKey: 'date',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Calendar1,
				iconClass: 'h-4 w-4 ',
				label: 'Date',
				style: 'justify-center'
			}),
		cell: ({ row }) => {
			const dateCellSnippet = createRawSnippet<[string]>((date) => {
				return {
					render: () => `<div class="flex flex-row justify-center">${formatDate(date())}</div>`
				};
			});

			return renderSnippet(dateCellSnippet, row.getValue('date'));
		}
	},
	{
		accessorKey: 'odometer',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: GaugeCircle,
				iconClass: 'h-4 w-4 ',
				label: 'Odometer',
				style: 'justify-center'
			}),
		cell: ({ row }) => {
			const odometerCellSnippet = createRawSnippet<[number]>((getOdometer) => {
				const odometer = getOdometer();
				return {
					render: () =>
						`<div class="flex flex-row justify-center">${formatDistance(odometer)}</div>`
				};
			});

			return renderSnippet(odometerCellSnippet, row.getValue('odometer'));
		}
	},
	{
		accessorKey: 'fuelAmount',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: PaintBucket,
				iconClass: 'h-4 w-4 ',
				label: 'Fuel Amount',
				style: 'justify-center'
			}),
		cell: ({ row }) => {
			const fuelAmountCellSnippet = createRawSnippet<[number]>((getFuelAmount) => {
				const fuelAmount = getFuelAmount();
				return {
					render: () =>
						`<div class="flex flex-row justify-center">${formatVolume(fuelAmount)}</div>`
				};
			});

			return renderSnippet(fuelAmountCellSnippet, row.getValue('fuelAmount'));
		}
	},
	{
		accessorKey: 'cost',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Banknote,
				iconClass: 'h-4 w-4 ',
				label: 'Cost',
				style: 'justify-center'
			}),
		cell: ({ row }) => {
			const costCellSnippet = createRawSnippet<[number]>((getCost) => {
				const cost = getCost();
				return {
					render: () => `<div class="flex flex-row justify-center">${formatCurrency(cost)}</div>`
				};
			});

			return renderSnippet(costCellSnippet, row.getValue('cost'));
		}
	},
	{
		accessorKey: 'filled',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Fuel,
				iconClass: 'h-4 w-4 ',
				label: 'Full Tank',
				style: 'justify-center'
			}),
		cell: ({ row }) =>
			renderComponent(Badge, {
				variant: 'outline',
				class: 'flex flex-row justify-center',
				children: createRawSnippet(() => {
					return {
						render: () => `${row.getValue('filled') ? 'Yes' : 'No'}`
					};
				})
			})
	},
	{
		accessorKey: 'missedLast',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: SkipBack,
				iconClass: 'h-4 w-4 ',
				label: 'Missed Last',
				style: 'justify-center'
			}),
		cell: ({ row }) =>
			renderComponent(Badge, {
				variant: 'outline',
				children: createRawSnippet(() => {
					return {
						render: () => `${row.getValue('missedLast') ? 'Yes' : 'No'}`
					};
				})
			})
	},
	{
		accessorKey: 'notes',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Notebook,
				iconClass: 'h-4 w-4 ',
				label: 'Notes',
				style: 'justify-center'
			})
	}
];
