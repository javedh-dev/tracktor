DELETE from `configs` where key = 'unitOfMeasure';
--> statement-breakpoint
INSERT into `configs` values ('unitOfDistance','kilometer','Unit of measure for distance', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT into `configs` values ('unitOfVolume','liter','Unit of measure for volume', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT into `configs` values ('locale','en','Locale for all formatting options', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT into `configs` values ('timezone','UTC','Timezone to be used for all dates', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);