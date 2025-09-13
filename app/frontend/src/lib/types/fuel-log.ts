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

export const columns: ColumnDef<FuelLog>[] = [
	{
		accessorKey: 'date',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Calendar1,
				iconClass: 'h-4 w-4',
				label: 'Date',
				style: 'justify-start'
			}),
		cell: ({ row }) => {
			const dateCellSnippet = createRawSnippet<[string]>((date) => {
				return {
					render: () => `<div class="flex flex-row justify-start">${formatDate(date())}</div>`
				};
			});
			return renderSnippet(dateCellSnippet, row.getValue('date'));
		}
	},
	{
		accessorKey: 'odometer',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: CircleGauge,
				iconClass: 'h-4 w-4 ',
				label: 'Odometer',
				style: 'justify-start'
			}),
		cell: ({ row }) => {
			const odometerCellSnippet = createRawSnippet<[number]>((getOdometer) => {
				const odometer = getOdometer();
				return {
					render: () => `<div class="flex flex-row justify-start">${formatDistance(odometer)}</div>`
				};
			});

			return renderSnippet(odometerCellSnippet, row.getValue('odometer'));
		}
	},
	{
		accessorKey: 'filled',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Fuel,
				iconClass: 'h-4 w-4',
				label: 'Full Tank',
				style: 'max-w-24 justify-start'
			}),
		cell: ({ row }) =>
			renderComponent(Badge, {
				variant: 'outline',
				children: createRawSnippet(() => {
					return {
						render: () => `<span>${row.getValue('filled') ? 'Yes' : 'No'}</span>`
					};
				})
			})
	},
	{
		accessorKey: 'missedLast',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: SkipBack,
				iconClass: 'h-4 w-4',
				label: 'Missed Last',
				style: 'max-w-24 justify-start'
			}),
		cell: ({ row }) =>
			renderComponent(Badge, {
				variant: 'outline',
				children: createRawSnippet(() => {
					return {
						render: () => `<span>${row.getValue('missedLast') ? 'Yes' : 'No'}</span>`
					};
				})
			})
	},
	{
		accessorKey: 'fuelAmount',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: PaintBucket,
				iconClass: 'h-4 w-4 ',
				label: 'Volume',
				style: 'justify-start'
			}),
		cell: ({ row }) => {
			const fuelAmountCellSnippet = createRawSnippet<[number]>((fuelAmount) => {
				return {
					render: () =>
						`<div class="flex flex-row justify-start">${formatVolume(fuelAmount())}</div>`
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
				style: 'justify-start'
			}),
		cell: ({ row }) => {
			const costCellSnippet = createRawSnippet<[number]>((cost) => {
				return {
					render: () => `<div class="flex flex-row justify-start">${formatCurrency(cost())}</div>`
				};
			});

			return renderSnippet(costCellSnippet, row.getValue('cost'));
		}
	},
	{
		accessorKey: 'notes',
		header: () =>
			renderComponent(LabelWithIcon, {
				icon: Notebook,
				iconClass: 'h-4 w-4',
				label: 'Notes',
				style: 'justify-start'
			}),
		cell: ({ row }) => {
			const noteSnippet = createRawSnippet<[string]>((note) => {
				return {
					render: () => `<div class="flex flex-row justify-start">${note() || '-'}</div>`
				};
			});
			return renderSnippet(noteSnippet, row.getValue('notes'));
		}
	},
	{
		id: 'actions',
		cell: ({ row }) =>
			renderComponent(FuelLogContextMenu, {
				fuelLog: row.original
			})
	}
];
