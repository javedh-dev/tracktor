<script lang="ts">
  import { Calendar as CalendarPrimitive } from 'bits-ui';
  import * as CalendarUI from '$ui/calendar';
  import { today, getLocalTimeZone, type DateValue } from '@internationalized/date';
  import { getLocale } from '$lib/paraglide/runtime.js';
  import type { DashboardSummary } from '$lib/domain/dashboard';
  import { formatDateForCalendar } from '$lib/helper/format.helper';
  import Fuel from '@lucide/svelte/icons/fuel';
  import Wrench from '@lucide/svelte/icons/wrench';
  import Bell from '@lucide/svelte/icons/bell';
  import { ACCENT } from '$lib/helper/accent-color.helper';

  let { summary, loading }: { summary: DashboardSummary | null; loading: boolean } = $props();

  type EventKind = 'reminder' | 'fuel' | 'maintenance';
  interface DayEvent {
    id: string;
    label: string;
    kind: EventKind;
  }

  const KIND_STYLES: Record<EventKind, { dot: string; badge: string; icon: string }> = {
    reminder: { dot: ACCENT.plum.solid, badge: ACCENT.plum.soft, icon: ACCENT.plum.text },
    fuel: { dot: ACCENT.moss.solid, badge: ACCENT.moss.soft, icon: ACCENT.moss.text },
    maintenance: { dot: ACCENT.ochre.solid, badge: ACCENT.ochre.soft, icon: ACCENT.ochre.text }
  };

  const KIND_ICONS: Record<EventKind, typeof Bell> = {
    reminder: Bell,
    fuel: Fuel,
    maintenance: Wrench
  };

  // Keyed by ISO date (YYYY-MM-DD) — reminder due dates and past fuel/maintenance log dates both
  // arrive as date strings prefixed with that format, so a plain slice lines them up with CalendarDate.toString().
  const eventsByDate = $derived.by(() => {
    const map = new Map<string, DayEvent[]>();
    const add = (key: string, event: DayEvent) => {
      const list = map.get(key);
      if (list) list.push(event);
      else map.set(key, [event]);
    };

    for (const r of summary?.compliance.upcomingReminders ?? []) {
      add(r.dueDate.slice(0, 10), {
        id: `reminder-${r.id}`,
        label: `${r.vehicleName} — ${r.note || r.type}`,
        kind: 'reminder'
      });
    }
    for (const a of summary?.activity ?? []) {
      add(a.date.slice(0, 10), {
        id: a.id,
        label: `${a.vehicleName} — ${a.description}`,
        kind: a.type
      });
    }
    return map;
  });

  let selected = $state<DateValue>(today(getLocalTimeZone()));
  let placeholder = $state<DateValue>(today(getLocalTimeZone()));

  const selectedEvents = $derived(eventsByDate.get(selected.toString()) ?? []);
</script>

{#if loading && !summary}
  <div class="text-muted-foreground flex h-full items-center justify-center text-sm">
    Loading calendar...
  </div>
{:else}
  <div class="flex h-full min-h-0 flex-col gap-2">
    <!-- The shared $ui/calendar Root is a fixed compact size (built for date-picker popovers), so
         the grid is assembled from its pieces directly here with a CSS-grid body: each week row
         becomes `display:contents` so its cells join one 7-col grid that scales with the card. -->
    <CalendarPrimitive.Root
      type="single"
      bind:value={selected as never}
      bind:placeholder
      weekdayFormat="short"
      monthFormat="long"
      yearFormat="numeric"
      disableDaysOutsideMonth={false}
      locale={getLocale()}
      class="w-full shrink-0 [--cell-size:--spacing(8)]"
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
                              class="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center gap-0.5"
                            >
                              {#each events.slice(0, 3) as event (event.id)}
                                <span class="size-1 rounded-full {KIND_STYLES[event.kind].dot}"
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

    <div class="min-h-0 flex-1 overflow-y-auto border-t pt-2">
      <p class="text-muted-foreground mb-1.5 text-xs font-medium">
        {formatDateForCalendar(selected)}
      </p>
      {#if selectedEvents.length === 0}
        <p class="text-muted-foreground text-sm">No activity or reminders on this date.</p>
      {:else}
        <ul class="space-y-1.5">
          {#each selectedEvents as event (event.id)}
            {@const Icon = KIND_ICONS[event.kind]}
            <li class="flex items-center gap-2 text-sm">
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-md {KIND_STYLES[
                  event.kind
                ].badge} {KIND_STYLES[event.kind].icon}"
              >
                <Icon class="size-3.5" />
              </span>
              <span class="min-w-0 truncate">{event.label}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/if}
