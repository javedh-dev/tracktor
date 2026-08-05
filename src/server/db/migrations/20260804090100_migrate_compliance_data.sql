INSERT INTO `compliance_documents` (`id`, `vehicle_id`, `type`, `document_number`, `issuer`, `start_date`, `end_date`, `recurrence_type`, `recurrence_interval`, `cost`, `notes`, `attachment`, `created_at`, `updated_at`)
SELECT `id`, `vehicle_id`, 'insurance', `policy_number`, `provider`, `start_date`, `end_date`, `recurrence_type`, `recurrence_interval`, `cost`, `notes`, `attachment`, `created_at`, `updated_at`
FROM `insurances`;
--> statement-breakpoint
INSERT INTO `compliance_documents` (`id`, `vehicle_id`, `type`, `document_number`, `issuer`, `start_date`, `end_date`, `recurrence_type`, `recurrence_interval`, `notes`, `attachment`, `created_at`, `updated_at`)
SELECT `id`, `vehicle_id`, 'emissions', `certificate_number`, `testing_center`, `issue_date`, `expiry_date`, `recurrence_type`, `recurrence_interval`, `notes`, `attachment`, `created_at`, `updated_at`
FROM `pollution_certificates`;
--> statement-breakpoint
INSERT INTO `configs` (`key`, `value`, `description`, `created_at`, `updated_at`)
SELECT 'featureCompliance',
	CASE
		WHEN (SELECT `value` FROM `configs` WHERE `key` = 'featurePucc') = 'false'
			AND (SELECT `value` FROM `configs` WHERE `key` = 'featureInsurance') = 'false'
		THEN 'false'
		ELSE 'true'
	END,
	'Enable/Disable Compliance feature',
	CURRENT_TIMESTAMP,
	CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `configs` WHERE `key` = 'featureCompliance');
--> statement-breakpoint
DELETE FROM `configs` WHERE `key` IN ('featurePucc', 'featureInsurance');
