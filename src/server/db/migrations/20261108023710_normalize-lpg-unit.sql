UPDATE `configs` SET `value` = 'liter', `updated_at` = CURRENT_TIMESTAMP
WHERE `key` = 'unitOfLpg' AND `value` = 'litre';
