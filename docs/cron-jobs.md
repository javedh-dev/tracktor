# Cron Jobs in Tracktor

Tracktor includes a built-in cron job system for scheduling recurring tasks at specified times. This guide explains how the system works and how to add new jobs.

## Overview

The cron job system uses the [node-cron](https://www.npmjs.com/package/node-cron) library to schedule tasks. Jobs are registered at server startup and run automatically according to their configured schedules.

## Project Structure

```
src/
├── server/
│   ├── services/
│   │   └── cronService.ts          # Cron job manager
│   └── jobs/
│       └── reminderTriggerJob.ts    # Scheduled job handlers
└── hooks.server.ts                 # Server initialization (includes cron setup)
```

## Default Scheduled Jobs

### Daily Reminder Trigger (`daily-reminder-trigger`)

- **Schedule:** 8:00 AM every day (`0 8 * * *`)
- **Timezone:** Configured via `TZ` environment variable (defaults to `UTC`)
- **Description:** Checks for reminders that are due or overdue and processes them
- **Handler:** `handleDailyReminderTrigger()`

### Weekly Maintenance Check (`weekly-maintenance-check`)

- **Schedule:** Monday 9:00 AM (`0 9 * * 1`)
- **Timezone:** Configured via `TZ` environment variable (defaults to `UTC`)
- **Description:** Performs weekly vehicle status checks
- **Handler:** `handleWeeklyMaintenanceCheck()`

## Cron Expression Format

Cron expressions use the standard format with 5 fields:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (0 - 11)
│ │ │ │ ┌───────────── day of week (0 - 6) (0 = Sunday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Common Cron Expressions

| Expression         | Description                       |
| ------------------ | --------------------------------- |
| `0 0 * * *`        | Every day at midnight             |
| `0 */6 * * *`      | Every 6 hours                     |
| `0 8 * * *`        | Every day at 8:00 AM              |
| `0 0 * * 0`        | Every Sunday at midnight          |
| `0 9 * * 1`        | Every Monday at 9:00 AM           |
| `*/15 * * * *`     | Every 15 minutes                  |
| `0 10,14,18 * * *` | At 10:00 AM, 2:00 PM, and 6:00 PM |

## Adding a New Cron Job

### Step 1: Create the Job Handler

Create a new handler function in `src/server/jobs/reminderTriggerJob.ts` (or a separate file):

```typescript
import { logger } from '$server/config';

export async function handleMyDailyTask(): Promise<void> {
	try {
		logger.info('[MyDailyTask] Starting...');

		// Your job logic here
		console.log('Performing scheduled task');

		logger.info('[MyDailyTask] Completed');
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
		logger.error('[MyDailyTask] Error:', {
			error: errorMsg,
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}
```

### Step 2: Register the Job in hooks.server.ts

In the `initializeCronJobs()` function, add:

```typescript
cronJobManager.registerJob({
	name: 'my-daily-task',
	schedule: '0 10 * * *', // 10:00 AM every day
	timezone: env.TZ || 'UTC',
	handler: handleMyDailyTask,
	runOnInit: false, // Set to true for testing
	onError: (error) => {
		logger.error('My daily task failed:', error);
		// Optional: Send alert/notification
	}
});
```

## CronJobManager API

The `cronJobManager` singleton provides the following methods:

### `initialize()`

Initialize the cron job manager. Must be called before registering jobs.

```typescript
cronJobManager.initialize();
```

### `registerJob(config: CronJobConfig)`

Register a new cron job.

```typescript
cronJobManager.registerJob({
	name: 'job-name',
	schedule: '0 8 * * *',
	timezone: 'America/New_York',
	handler: async () => {
		// Job logic
	},
	runOnInit: false,
	onError: (error) => {
		/* handle error */
	}
});
```

**Parameters:**

- `name` (string): Unique job identifier
- `schedule` (string): Cron expression
- `timezone` (string, optional): Timezone (e.g., 'UTC', 'America/New_York')
- `handler` (Function): Async function to execute
- `runOnInit` (boolean, optional): Run immediately on registration (default: false)
- `onError` (Function, optional): Error handler

### `getJob(name: string)`

Get a registered job by name.

```typescript
const job = cronJobManager.getJob('daily-reminder-trigger');
```

### `getAllJobs()`

Get all registered jobs.

```typescript
const jobs = cronJobManager.getAllJobs();
```

### `stopJob(name: string)`

Temporarily stop a cron job.

```typescript
cronJobManager.stopJob('daily-reminder-trigger');
```

### `startJob(name: string)`

Start a previously stopped cron job.

```typescript
cronJobManager.startJob('daily-reminder-trigger');
```

### `unregisterJob(name: string)`

Unregister and completely remove a job.

```typescript
cronJobManager.unregisterJob('my-job');
```

### `stopAll()`

Stop all running cron jobs.

```typescript
cronJobManager.stopAll();
```

### `destroyAll()`

Stop and destroy all cron jobs.

```typescript
cronJobManager.destroyAll();
```

### `getStats()`

Get statistics about registered jobs.

```typescript
const stats = cronJobManager.getStats();
// Returns: { totalJobs: 2, jobs: [...] }
```

## Environment Configuration

Cron job scheduling respects environment variables:

- **`TZ`**: Timezone for cron schedules (e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo`)
  - Default: `UTC`
  - When setting, use IANA timezone identifiers

Example `.env`:

```env
TZ=America/New_York
```

### Supported Timezones

Common timezone identifiers:

| Timezone          | Identifier            |
| ----------------- | --------------------- |
| UTC               | `UTC`                 |
| Eastern Standard  | `America/New_York`    |
| Central Standard  | `America/Chicago`     |
| Mountain Standard | `America/Denver`      |
| Pacific Standard  | `America/Los_Angeles` |
| UTC+5:30 (IST)    | `Asia/Kolkata`        |
| Central European  | `Europe/London`       |
| UTC+8 (Singapore) | `Asia/Singapore`      |

For a complete list, see [IANA Time Zone Database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

## Error Handling

### Built-in Error Handling

The cron job system automatically:

1. Logs errors to Winston logger with context
2. Calls the optional `onError` handler
3. Continues running despite errors (doesn't exit)

### Job-Level Error Handling

```typescript
export async function handleMyTask(): Promise<void> {
	try {
		// Job logic
	} catch (error) {
		logger.error('MyTask failed:', {
			error: error instanceof Error ? error.message : String(error),
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}
```

## Graceful Shutdown

The cron system automatically:

1. Stops all jobs on `SIGTERM`
2. Stops all jobs on `SIGINT` (Ctrl+C)
3. Logs shutdown activity
4. Allows pending tasks to complete before exit

No additional configuration is needed.

## Example: Database Cleanup Job

Here's a complete example of adding a database cleanup job:

**src/server/jobs/reminderTriggerJob.ts:**

```typescript
export async function handleDailyDatabaseCleanup(): Promise<void> {
	try {
		logger.info('[DBCleanupJob] Starting daily cleanup...');

		// Delete old logs (older than 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		// Your cleanup logic here
		logger.info('[DBCleanupJob] Cleanup completed');
	} catch (error) {
		logger.error('[DBCleanupJob] Error:', error);
		throw error;
	}
}
```

**src/hooks.server.ts (in initializeCronJobs()):**

```typescript
cronJobManager.registerJob({
	name: 'daily-db-cleanup',
	schedule: '0 2 * * *', // 2:00 AM every day
	timezone: env.TZ || 'UTC',
	handler: handleDailyDatabaseCleanup
});
```

## Testing Cron Jobs

### Run on Startup (Testing)

Set `runOnInit: true` to execute a job immediately when the server starts:

```typescript
cronJobManager.registerJob({
	name: 'test-job',
	schedule: '0 8 * * *',
	handler: handleMyTask,
	runOnInit: true // ← Runs immediately when registered
});
```

### Manual Execution

Test a job manually:

```typescript
import { handleDailyReminderTrigger } from '$server/jobs/reminderTriggerJob';

// In your test or API endpoint
await handleDailyReminderTrigger();
```

### Check Job Status

```typescript
const stats = cronJobManager.getStats();
console.log(stats);
// Output:
// {
//   totalJobs: 2,
//   jobs: [
//     { name: 'daily-reminder-trigger', schedule: '0 8 * * *', status: 'running' },
//     { name: 'weekly-maintenance-check', schedule: '0 9 * * 1', status: 'running' }
//   ]
// }
```

## Logging

All cron activities are logged to Winston logger:

```
[CronJob] Registered: daily-reminder-trigger (0 8 * * *)
[CronJob] Starting: daily-reminder-trigger
[ReminderJob] Processing due reminders...
[ReminderJob] Found 3 due reminder(s)
[CronJob] Completed: daily-reminder-trigger
```

Check logs in `logs/` directory or console output.

## Troubleshooting

### Job Not Running

1. Check if the server is running
2. Verify the cron expression is correct
3. Check timezone configuration
4. Verify the job name is registered
5. Check logs for errors

### Timezone Issues

Jobs run in the specified timezone. Verify:

1. `TZ` environment variable is set correctly
2. Cron expression matches the intended timezone
3. System timezone doesn't affect job scheduling

### Performance Issues

If jobs are running too frequently or impacting performance:

1. Adjust the cron schedule
2. Optimize the job handler logic
3. Consider adding rate limiting or debouncing
4. Monitor database performance during job execution

## Best Practices

1. **Use descriptive job names** that include frequency and purpose (e.g., `daily-reminder-trigger`)
2. **Add comprehensive logging** for debugging and monitoring
3. **Handle errors gracefully** and don't let exceptions crash the job
4. **Test jobs thoroughly** before deploying to production
5. **Monitor job execution** via logs and metrics
6. **Keep jobs lightweight** to avoid blocking other operations
7. **Use appropriate timezones** for user-facing scheduled tasks
8. **Document custom jobs** with comments and examples
9. **Set reasonable schedules** to avoid excessive database load
10. **Consider staggering multiple jobs** to prevent concurrent heavy operations

## Future Enhancements

Potential improvements to the cron system:

- API endpoints to manage jobs (start, stop, list)
- Job execution history and audit trail
- Notifications/alerts for job failures
- Admin UI for job management
- Job performance metrics and monitoring
- Persistent job configuration in database
- Distributed job scheduling (for multi-instance deployments)

---

For more information on cron expressions, visit [crontab.guru](https://crontab.guru/).
