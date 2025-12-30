-- Custom SQL migration file, put your code below! --
INSERT into `configs` values ('customCss','','Custom CSS for the application', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT INTO `configs` VALUES ('featureFuelLog','true','Enable/Disable Fuel Log feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT INTO `configs` VALUES ('featureMaintenance','true','Enable/Disable Maintenance feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT INTO `configs` VALUES ('featurePucc','true','Enable/Disable PUCC feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT INTO `configs` VALUES ('featureReminders','true','Enable/Disable Reminders feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT INTO `configs` VALUES ('featureInsurance','true','Enable/Disable Insurance feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
--> statement-breakpoint
INSERT INTO `configs` VALUES ('featureOverview','true','Enable/Disable Overview feature', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
