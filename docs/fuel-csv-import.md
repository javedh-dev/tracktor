# Fuel log CSV import

Select a vehicle on the Fuel page, then choose Import. Select the delimiter and the
date format used by the file; this can differ from the application's display format.
For `2026-01-18`, select `yyyy-MM-dd`.

Map the file's headers to Tracktor fields. Only `date` and `cost` are required.
`odometer`, `fuelAmount`, `filled`, `missedLast`, and `notes` are optional. Map
`price` to cost and `gallons` to fuel amount for the example below. `trip_miles`
is not required and can remain unmapped.

```csv
date,price,gallons,trip_miles,odometer
2026-01-18,28.82,11.308,288.7,118628
```

Numbers use a decimal point without grouping separators. Fuel quantities retain
their precision; they are not restricted to two decimal places. Quantities use
the configured vehicle fuel unit, and distances use the configured distance unit.
The importer does not convert units. Cost and supplied quantities must be positive
finite numbers. Blank optional quantities are stored as null.

Imports run one row at a time. Successful rows remain saved if another row fails;
the operation is not atomic. Review the imported/failed counts and browser-console
row errors before retrying, because retrying successful rows can create duplicates.
