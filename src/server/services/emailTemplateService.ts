import type { Notification } from '$lib/domain/notification';

export interface NotificationGroup {
	type: string;
	notifications: Notification[];
	label: string;
	icon: string;
	color: string;
	bgColor: string;
}

/**
 * Group notifications by type
 */
export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
	const groups: Record<string, Notification[]> = {};

	notifications.forEach((notification) => {
		if (!groups[notification.type]) {
			groups[notification.type] = [];
		}
		groups[notification.type].push(notification);
	});

	return Object.entries(groups).map(([type, notifs]) => ({
		type,
		notifications: notifs,
		...getTypeMetadata(type)
	}));
}

/**
 * Get metadata for notification type (label, icon, colors)
 */
function getTypeMetadata(type: string): {
	label: string;
	icon: string;
	color: string;
	bgColor: string;
} {
	const metadata: Record<string, { label: string; icon: string; color: string; bgColor: string }> =
		{
			reminder: {
				label: 'Reminders',
				icon: '🔔',
				color: '#2563eb',
				bgColor: '#eff6ff'
			},
			alert: {
				label: 'Alerts',
				icon: '⚠️',
				color: '#dc2626',
				bgColor: '#fef2f2'
			},
			maintenance: {
				label: 'Maintenance',
				icon: '🔧',
				color: '#7c3aed',
				bgColor: '#faf5ff'
			},
			insurance: {
				label: 'Insurance',
				icon: '🛡️',
				color: '#059669',
				bgColor: '#f0fdf4'
			},
			pollution: {
				label: 'Pollution Certificate',
				icon: '🌿',
				color: '#0891b2',
				bgColor: '#ecfeff'
			},
			registration: {
				label: 'Registration',
				icon: '📋',
				color: '#ea580c',
				bgColor: '#fff7ed'
			}
		};

	return (
		metadata[type] || {
			label: type.charAt(0).toUpperCase() + type.slice(1),
			icon: '📌',
			color: '#6b7280',
			bgColor: '#f9fafb'
		}
	);
}

/**
 * Format a date in a human-readable format
 */
function formatDate(dateString: string | Date): string {
	const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Calculate days until due date
 */
function getDaysUntilDue(dueDate: string | Date): { days: number; label: string; urgent: boolean } {
	const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
	const now = new Date();
	const diffTime = due.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	let label = '';
	let urgent = false;

	if (diffDays < 0) {
		label = `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
		urgent = true;
	} else if (diffDays === 0) {
		label = 'Due today';
		urgent = true;
	} else if (diffDays === 1) {
		label = 'Due tomorrow';
		urgent = true;
	} else if (diffDays <= 7) {
		label = `${diffDays} days remaining`;
		urgent = true;
	} else if (diffDays <= 30) {
		label = `${diffDays} days remaining`;
		urgent = false;
	} else {
		label = `${diffDays} days remaining`;
		urgent = false;
	}

	return { days: diffDays, label, urgent };
}

/**
 * Generate plain text email content for notification digest
 */
export function generatePlainTextDigest(
	notificationGroups: NotificationGroup[],
	totalCount: number
): string {
	let text = `Tracktor Notification Summary\n`;
	text += `=====================================\n\n`;
	text += `You have ${totalCount} pending notification${totalCount !== 1 ? 's' : ''}.\n\n`;

	notificationGroups.forEach((group) => {
		text += `${group.icon} ${group.label} (${group.notifications.length})\n`;
		text += `-`.repeat(40) + '\n';

		group.notifications.forEach((notification, index) => {
			const daysInfo = getDaysUntilDue(notification.dueDate);
			text += `${index + 1}. ${notification.message}\n`;
			text += `   Due: ${formatDate(notification.dueDate)} (${daysInfo.label})\n`;
			if (index < group.notifications.length - 1) {
				text += '\n';
			}
		});

		text += '\n\n';
	});

	text += `=====================================\n`;
	text += `Log in to Tracktor to view more details and manage your notifications.\n`;

	return text;
}

/**
 * Generate HTML email content for notification digest
 * Optimized for mobile email clients (Gmail, Outlook, Apple Mail, etc.)
 */
export function generateHtmlDigest(
	notificationGroups: NotificationGroup[],
	totalCount: number
): string {
	const groupsHtml = notificationGroups
		.map((group) => {
			const notificationsHtml = group.notifications
				.map((notification) => {
					const daysInfo = getDaysUntilDue(notification.dueDate);
					const urgentBadge = daysInfo.urgent
						? `<span style="display: inline-block; background-color: #fef2f2; color: #dc2626; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Urgent</span>`
						: '';

					return `
				<tr>
					<td style="padding: 16px; border-bottom: 1px solid #f3f4f6;">
						<table width="100%" cellpadding="0" cellspacing="0" border="0">
							<tr>
								<td>
									<div style="font-size: 15px; color: #111827; font-weight: 500; margin-bottom: 6px; line-height: 1.4;">
										${escapeHtml(notification.message)}
									</div>
									<div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">
										📅 ${formatDate(notification.dueDate)}
									</div>
									<div style="display: flex; align-items: center; gap: 8px;">
										<span style="font-size: 12px; color: ${daysInfo.urgent ? '#dc2626' : '#059669'}; font-weight: 600;">
											${daysInfo.label}
										</span>
										${urgentBadge}
									</div>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			`;
				})
				.join('');

			return `
			<!--[if mso]>
			<table width="100%" cellpadding="0" cellspacing="0" border="0">
				<tr>
					<td>
			<![endif]-->
			<div style="margin-bottom: 24px;">
				<!-- Category Header -->
				<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius: 12px; overflow: hidden; background-color: ${group.bgColor}; margin-bottom: 12px;">
					<tr>
						<td style="padding: 16px;">
							<table width="100%" cellpadding="0" cellspacing="0" border="0">
								<tr>
									<td style="vertical-align: middle;">
										<span style="font-size: 24px; margin-right: 8px;">${group.icon}</span>
										<span style="font-size: 18px; font-weight: 700; color: ${group.color};">
											${group.label}
										</span>
									</td>
									<td align="right" style="vertical-align: middle;">
										<span style="display: inline-block; background-color: white; color: ${group.color}; font-size: 14px; font-weight: 700; padding: 6px 12px; border-radius: 20px; min-width: 24px; text-align: center;">
											${group.notifications.length}
										</span>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
				
				<!-- Notifications List -->
				<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); border: 1px solid #f3f4f6;">
					<tbody>
						${notificationsHtml}
					</tbody>
				</table>
			</div>
			<!--[if mso]>
					</td>
				</tr>
			</table>
			<![endif]-->
		`;
		})
		.join('');

	return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="x-apple-disable-message-reformatting">
	<title>Tracktor Notification Summary</title>
	<!--[if mso]>
	<style type="text/css">
		body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
	</style>
	<![endif]-->
	<style type="text/css">
		@media only screen and (max-width: 600px) {
			.content-wrapper {
				padding: 20px 16px !important;
			}
			.header-text {
				font-size: 20px !important;
			}
			.summary-text {
				font-size: 14px !important;
			}
			.notification-message {
				font-size: 14px !important;
			}
		}
		
		/* Gmail/Outlook fixes */
		u + .body .content-wrapper {
			background-color: #f3f4f6 !important;
		}
		
		/* Dark mode support */
		@media (prefers-color-scheme: dark) {
			.dark-mode-bg {
				background-color: #1f2937 !important;
			}
			.dark-mode-text {
				color: #f9fafb !important;
			}
		}
	</style>
</head>
<body class="body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f3f4f6;">
	<!-- Hidden preheader text -->
	<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
		You have ${totalCount} pending notification${totalCount !== 1 ? 's' : ''} in Tracktor
	</div>
	
	<!-- Full width container -->
	<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 0; margin: 0;">
		<tr>
			<td align="center" style="padding: 0;">
				<!-- Main email container -->
				<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
					<tr>
						<td class="content-wrapper" style="padding: 40px 20px;">
							
							<!-- Header with gradient -->
							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 16px 16px 0 0; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
								<tr>
									<td style="padding: 32px 24px; text-align: center;">
										<div style="font-size: 32px; margin-bottom: 8px;">🚗</div>
										<h1 class="header-text" style="color: white; margin: 0; font-size: 26px; font-weight: 700; line-height: 1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
											Tracktor Notifications
										</h1>
										<p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
											Your vehicle management digest
										</p>
									</td>
								</tr>
							</table>
							
							<!-- Main content area -->
							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: white; border-radius: 0 0 16px 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
								<tr>
									<td style="padding: 32px 24px;">
										
										<!-- Summary section -->
										<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; margin-bottom: 32px; border: 2px solid #bae6fd;">
											<tr>
												<td style="padding: 20px; text-align: center;">
													<div style="font-size: 36px; font-weight: 800; color: #0369a1; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
														${totalCount}
													</div>
													<p class="summary-text" style="font-size: 15px; color: #075985; margin: 0; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
														Pending Notification${totalCount !== 1 ? 's' : ''}
													</p>
												</td>
											</tr>
										</table>
										
										<!-- Notification groups -->
										${groupsHtml}
										
										<!-- Footer section -->
										<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #f3f4f6;">
											<tr>
												<td style="text-align: center;">
													<p style="font-size: 14px; color: #6b7280; margin: 0 0 16px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
														Log in to Tracktor to manage your notifications
													</p>
													<!--[if mso]>
													<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="#" style="height:44px;v-text-anchor:middle;width:180px;" arcsize="25%" stroke="f" fillcolor="#3b82f6">
														<w:anchorlock/>
														<center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Open Tracktor</center>
													</v:roundrect>
													<![endif]-->
													<a href="#" style="background-color: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; display: inline-block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); mso-hide: all;">
														Open Tracktor →
													</a>
												</td>
											</tr>
										</table>
										
									</td>
								</tr>
							</table>
							
							<!-- Email footer -->
							<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
								<tr>
									<td style="text-align: center; padding: 0 20px;">
										<p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
											This is an automated message from Tracktor
										</p>
										<p style="font-size: 11px; color: #d1d5db; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
											Please do not reply to this email
										</p>
									</td>
								</tr>
							</table>
							
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
	`.trim();
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, (char) => map[char]);
}
