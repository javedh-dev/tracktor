<script lang="ts" generics="TData, TValue">
	import {
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState
	} from '@tanstack/table-core';
	import { createSvelteTable, FlexRender } from '$ui/data-table/index.js';
	import * as Table from '$ui/table/index.js';
	import LabelWithIcon from '$appui/LabelWithIcon.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import Columns3 from '@lucide/svelte/icons/columns-3';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Search from '@lucide/svelte/icons/search';
	import Button from '$ui/button/button.svelte';
	import * as DropdownMenu from '$ui/dropdown-menu';
	import * as Select from '$ui/select';
	import Badge from '$ui/badge/badge.svelte';
	import Input from '$appui/input.svelte';
	import * as m from '$lib/paraglide/messages';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};
	let pageSize = $state('5');
	let { columns, data }: DataTableProps<TData, TValue> = $props();
	let pagination = $derived<PaginationState>({ pageIndex: 0, pageSize: Number(pageSize) });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let rowSelection = $state<RowSelectionState>({});
	let columnVisibility = $state<VisibilityState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		get columns() {
			return columns;
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			},
			get columnFilters() {
				return columnFilters;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		}
	});

	// Calculate visible page numbers with ellipsis
	const visiblePages = $derived(() => {
		const totalPages = table.getPageCount();
		const currentPage = table.getState().pagination.pageIndex;
		const maxVisiblePages = 7; // Show max 7 page buttons

		if (totalPages <= maxVisiblePages) {
			// Show all pages if total is small
			return Array.from({ length: totalPages }, (_, i) => i);
		}

		const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

		// Always show first page
		pages.push(0);

		// Calculate range around current page
		const rangeStart = Math.max(1, currentPage - 1);
		const rangeEnd = Math.min(totalPages - 2, currentPage + 2);

		// Add ellipsis after first page if needed
		if (rangeStart > 1) {
			pages.push('ellipsis-start');
		}

		// Add pages around current page
		for (let i = rangeStart; i <= rangeEnd; i++) {
			pages.push(i);
		}

		// Add ellipsis before last page if needed
		if (rangeEnd < totalPages - 2) {
			pages.push('ellipsis-end');
		}

		// Always show last page
		pages.push(totalPages - 1);

		return pages;
	});
</script>

<div id="app-table-container">
	{#if !data || data.length === 0}
		<div class="flex h-24 flex-col items-center justify-center">
			<LabelWithIcon icon={CircleSlash2} iconClass="h-4 w-4" label={m.common_no_data_available()} />
		</div>
	{:else}
		<div class="mb-4 flex flex-row items-center justify-between gap-2">
			<Input
				placeholder={m.common_search()}
				value={(table.getColumn('notes')?.getFilterValue() as string) ?? ''}
				oninput={(e) => table.getColumn('notes')?.setFilterValue(e.currentTarget.value)}
				onchange={(e) => {
					table.getColumn('notes')?.setFilterValue(e.currentTarget.value);
				}}
				icon={Search}
				class="bg-background/60 h-full max-w-sm"
			/>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="outline" size="sm" {...props}>
							<Columns3 />
							<span class="inline">{m.common_columns()}</span>
							<ChevronDownIcon />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="center">
					{#each table
						.getAllColumns()
						.filter((col: any) => typeof col.accessorFn !== 'undefined' && col.getCanHide()) as column (column.id)}
						{@const headerContent = column.columnDef.header}
						{@const displayName =
							typeof headerContent === 'function'
								? (() => {
										try {
											const result = headerContent({} as any);
											// Try to extract label from rendered component
											if (result && typeof result === 'object' && 'props' in result) {
												return result.props?.label || column.id;
											}
											return column.id;
										} catch {
											return column.id;
										}
									})()
								: column.id}
						<DropdownMenu.CheckboxItem
							class="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{displayName}
						</DropdownMenu.CheckboxItem>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		<div class="rounded-t-md border text-sm">
			<Table.Root>
				<Table.Header>
					{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
						<Table.Row>
							{#each headerGroup.headers as header (header.id)}
								<Table.Head colspan={header.colSpan}>
									{#if !header.isPlaceholder}
										<FlexRender
											content={header.column.columnDef.header}
											context={header.getContext()}
										/>
									{/if}
								</Table.Head>
							{/each}
						</Table.Row>
					{/each}
				</Table.Header>
				<Table.Body class="bg-background/50">
					{#each table.getRowModel().rows as row (row.id)}
						<Table.Row data-state={row.getIsSelected() && 'selected'}>
							{#each row.getVisibleCells() as cell (cell.id)}
								<Table.Cell>
									<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
								</Table.Cell>
							{/each}
						</Table.Row>
					{:else}
						<Table.Row class="f">
							<Table.Cell colspan={columns.length} class="h-24">
								<LabelWithIcon
									icon={CircleSlash2}
									iconClass="h-4 w-4"
									style="justify-center"
									label={m.common_no_data_available()}
								/>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		<div class="flex items-center justify-between space-x-2 pt-4">
			<div class="flex flex-row items-center space-x-2">
				<Button
					variant="outline"
					size="icon-sm"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					class="cursor-pointer"
				>
					<ArrowLeft />
				</Button>
				{#each visiblePages() as pageItem}
					{#if typeof pageItem === 'number'}
						<Badge
							variant="outline"
							onclick={() => table.setPageIndex(pageItem)}
							class={`hover:bg-primary hover:text-background hidden cursor-pointer lg:inline-block ${
								table.getState().pagination.pageIndex === pageItem
									? 'bg-primary text-background'
									: ''
							}`}
						>
							{pageItem + 1}
						</Badge>
					{:else}
						<span class="hidden px-2 lg:inline-block">...</span>
					{/if}
				{/each}
				<Button
					variant="outline"
					size="icon-sm"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					class="cursor-pointer"
				>
					<ArrowRight />
				</Button>
			</div>
			<div class="flex flex-row items-center gap-4 text-sm">
				{m.common_rows_per_page()}
				<Select.Root type="single" bind:value={pageSize}>
					<Select.Trigger size="sm">{pageSize}</Select.Trigger>
					<Select.Content>
						{#each [5, 10, 15, 25, 50, 100] as rowsPerPage, index}
							<Select.Item value={rowsPerPage.toString()} id={index.toString()}>
								{rowsPerPage}
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		</div>
	{/if}
</div>
