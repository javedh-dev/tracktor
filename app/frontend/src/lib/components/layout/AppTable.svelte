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
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import LabelWithIcon from '$lib/components/ui/app/LabelWithIcon.svelte';
	import CircleSlash2 from '@lucide/svelte/icons/circle-slash-2';
	import Columns3 from '@lucide/svelte/icons/columns-3';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import Search from '@lucide/svelte/icons/search';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Select from '$lib/components/ui/select';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

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
		columns,
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
</script>

<div>
	{#if data.length === 0}
		<div class="flex h-24 flex-col items-center justify-center">
			<LabelWithIcon icon={CircleSlash2} iconClass="h-4 w-4" label={`No data avaialble`} />
		</div>
	{:else}
		<div class="mb-4 flex flex-row items-center justify-between gap-2">
			<Input
				placeholder="Search"
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
							<span class="inline">Columns</span>
							<ChevronDownIcon />
						</Button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="center">
					{#each table
						.getAllColumns()
						.filter((col: any) => typeof col.accessorFn !== 'undefined' && col.getCanHide()) as column (column.id)}
						<DropdownMenu.CheckboxItem
							class="capitalize"
							checked={column.getIsVisible()}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{column.id}
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
									label={`No data avaialble`}
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
					size="icon"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					class="cursor-pointer"
				>
					<ArrowLeft />
				</Button>
				{#each table.getPageOptions() as pageNum}
					<Badge
						variant="outline"
						onclick={() => table.setPageIndex(pageNum)}
						class="hover:bg-primary hover:text-background hidden cursor-pointer lg:inline-block"
					>
						{pageNum + 1}
					</Badge>
				{/each}
				<Button
					variant="outline"
					size="icon"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					class="cursor-pointer"
				>
					<ArrowRight />
				</Button>
			</div>
			<div class="flex flex-row items-center gap-4 text-sm">
				Rows per page
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
