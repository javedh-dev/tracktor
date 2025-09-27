# Database Patches

This directory contains database patches that are applied during application startup to ensure the database schema is up to date.

## How it works

1. Patches are automatically applied when the application starts
2. Each patch checks if changes are needed before applying them
3. Patches are idempotent - they can be run multiple times safely
4. Errors are handled gracefully to prevent application startup failures

## Current Patches

### addFuelLogColumns()

- **Purpose**: Adds `filled` and `missed_last` columns to the `fuel_logs` table
- **Default Values**:
  - `filled`: `1` (true) - assumes existing logs are full tank fills
  - `missed_last`: `0` (false) - assumes no missed logs initially
- **Safety**: Checks if columns already exist before attempting to add them

## Adding New Patches

1. Add your patch function to `index.ts`
2. Call it from the `applyPatches()` function
3. Ensure your patch is idempotent (safe to run multiple times)
4. Handle errors gracefully to avoid breaking app startup
5. Add logging for visibility

## Example Patch Function

```typescript
async function myNewPatch(): Promise<void> {
  try {
    // Check if patch is needed
    const needsPatch = await checkCondition();

    if (!needsPatch) {
      console.log("Patch already applied, skipping...");
      return;
    }

    // Apply the patch
    await db.run(sql`ALTER TABLE ...`);
    console.log("Patch applied successfully");
  } catch (error) {
    console.error("Error in myNewPatch:", error);
    // Handle gracefully - don't throw unless critical
  }
}
```
