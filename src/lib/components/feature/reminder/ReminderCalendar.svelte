<script lang="ts">
  import { Calendar as CalendarPrimitive } from 'bits-ui';
  import * as CalendarUI from '$ui/calendar';
  import { today, getLocalTimeZone, type DateValue } from '@internationalized/date';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import type { Reminder } from '$lib/domain/reminder';
  import { resolveWeekStartsOn } from '$lib/helper/date.helper';
  import { configStore } from '$stores/config.svelte';
  import * as m from '$lib/paraglide/messages';

  let {
    reminders,
    selected = $bindable(undefined)
  }: { reminders: Reminder[]; selected?: DateValue } = $props();

  type ReminderStatus = 'completed' | 'overdue' | 'upcoming';

  const STATUS_STYLES: Record<ReminderStatus, string> = {
    completed: 'bg-success',
    overdue: 'bg-destructive',
    upcoming: 'bg-info'
  };

  const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / 86_400_000);

  const statusOf = (r: Reminder): ReminderStatus => {
    if (r.isCompleted) return 'completed';
    return daysUntil(r.dueDate) < 0 ? 'overdue' : 'upcoming';
  };

  // Reminder due dates carry a local time-of-day, so keying by local Y/M/D lines them up with
  // CalendarDate.toString() (an ISO date, no time) instead of drifting a day off around UTC.
  const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const eventsByDate = $derived.by(() => {
    const map = new Map<string, Reminder[]>();
    for (const r of reminders) {
      const key = dateKey(r.dueDate);
      const list = map.get(key);
      if (list) list.push(r);
      else map.set(key, [r]);
    }
    return map;
  });

  let placeholder = $state<DateValue>(today(getLocalTimeZone()));

  const reminderKey = (r: Reminder) => r.id ?? `${r.vehicleId}-${r.dueDate.getTime()}`;
  const weekStartsOn = $derived(
    resolveWeekStartsOn(configStore.configs.weekStartDay, configStore.configs.locale)
  );
</script>

<CalendarPrimitive.Root
  type="single"
  bind:value={selected as never}
  bind:placeholder
  weekdayFormat="short"
  monthFormat="long"
  yearFormat="numeric"
  {weekStartsOn}
  disableDaysOutsideMonth={false}
  locale={getLocale()}
  class="w-full [--cell-size:--spacing(9)]"
>
  {#snippet children({ months, weekdays })}
    <CalendarUI.Months>
      <CalendarUI.Nav>
        <CalendarUI.PrevButton />
        <CalendarUI.NextButton />
      </CalendarUI.Nav>
      {#each months as month, monthIndex (month)}
        <CalendarUI.Month class="w-full">
          <CalendarUI.Header>
            <CalendarUI.Caption
              captionLayout="label"
              months={undefined}
              monthFormat="long"
              years={undefined}
              yearFormat="numeric"
              month={month.value}
              {monthIndex}
              bind:placeholder
              locale={getLocale()}
            />
          </CalendarUI.Header>
          <CalendarUI.Grid class="mt-2 grid w-full grid-cols-7 gap-1">
            <CalendarUI.GridHead class="contents">
              <CalendarUI.GridRow class="contents">
                {#each weekdays as weekday (weekday)}
                  <CalendarUI.HeadCell class="w-full text-center">
                    {weekday.slice(0, 2)}
                  </CalendarUI.HeadCell>
                {/each}
              </CalendarUI.GridRow>
            </CalendarUI.GridHead>
            <CalendarUI.GridBody class="contents">
              {#each month.weeks as weekDates (weekDates)}
                <CalendarUI.GridRow class="contents">
                  {#each weekDates as date (date)}
                    {@const events = eventsByDate.get(date.toString()) ?? []}
                    <CalendarUI.Cell
                      {date}
                      month={month.value}
                      class="relative h-auto w-full p-0.5"
                    >
                      <CalendarUI.Day class="aspect-square w-full" />
                      {#if events.length}
                        <div
                          class="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center gap-0.5"
                        >
                          {#each events.slice(0, 3) as event (reminderKey(event))}
                            <span class="size-1 rounded-full {STATUS_STYLES[statusOf(event)]}"
                            ></span>
                          {/each}
                        </div>
                      {/if}
                    </CalendarUI.Cell>
                  {/each}
                </CalendarUI.GridRow>
              {/each}
            </CalendarUI.GridBody>
          </CalendarUI.Grid>
        </CalendarUI.Month>
      {/each}
    </CalendarUI.Months>
  {/snippet}
</CalendarPrimitive.Root>

<div class="text-muted-foreground mt-3 flex flex-wrap gap-3 border-t pt-3 text-[11px]">
  <span class="flex items-center gap-1.5">
    <span class="size-1.5 rounded-full {STATUS_STYLES.upcoming}"></span>
    {m.reminder_section_upcoming()}
  </span>
  <span class="flex items-center gap-1.5">
    <span class="size-1.5 rounded-full {STATUS_STYLES.overdue}"></span>
    {m.reminder_status_overdue()}
  </span>
  <span class="flex items-center gap-1.5">
    <span class="size-1.5 rounded-full {STATUS_STYLES.completed}"></span>
    {m.reminder_status_completed()}
  </span>
</div>
