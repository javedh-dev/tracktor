<script lang="ts">
	import * as Form from '$ui/form/index.js';
	import FormLabel from '$appui/FormLabel.svelte';
	import Input from '$appui/input.svelte';
	import SubmitButton from '$appui/SubmitButton.svelte';
	import { authStore } from '$stores/auth.svelte';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { zod4 } from 'sveltekit-superforms/adapters';
	import { z } from 'zod/v4';
	import User from '@lucide/svelte/icons/user';
	import Lock from '@lucide/svelte/icons/lock';
	import { sheetStore } from '$stores/sheet.svelte';

	let processing = $state(false);

	const profileSchema = z
		.object({
			username: z.string().min(3, 'Username must be at least 3 characters'),
			currentPassword: z.string().optional(),
			newPassword: z.string().optional(),
			confirmPassword: z.string().optional()
		})
		.refine(
			(data) => {
				if (data.newPassword && !data.currentPassword) {
					return false;
				}
				return true;
			},
			{ message: 'Current password is required to change password', path: ['currentPassword'] }
		)
		.refine(
			(data) => {
				if (data.newPassword && data.newPassword.length < 6) {
					return false;
				}
				return true;
			},
			{ message: 'New password must be at least 6 characters', path: ['newPassword'] }
		)
		.refine(
			(data) => {
				if (data.newPassword && data.newPassword !== data.confirmPassword) {
					return false;
				}
				return true;
			},
			{ message: 'Passwords do not match', path: ['confirmPassword'] }
		);

	const form = superForm(defaults(zod4(profileSchema)), {
		validators: zod4(profileSchema),
		SPA: true,
		resetForm: false,
		onUpdated: async ({ form: f }) => {
			if (f.valid) {
				processing = true;
				const success = await authStore.updateProfile({
					username: f.data.username,
					currentPassword: f.data.currentPassword || undefined,
					newPassword: f.data.newPassword || undefined
				});

				if (success) {
					// Clear password fields after successful update
					formData.update((d) => ({
						...d,
						currentPassword: '',
						newPassword: '',
						confirmPassword: ''
					}));
					sheetStore.closeSheet();
				}
				processing = false;
			}
		}
	});

	const { form: formData, enhance } = form;

	$effect(() => {
		if (authStore.user) {
			formData.update((d) => ({ ...d, username: authStore.user!.username }));
		}
	});
</script>

<form id="auth-profile-form" use:enhance onsubmit={(e) => e.preventDefault()}>
	<fieldset class="flex flex-col gap-6" disabled={processing}>
		<Form.Field {form} name="username" class="w-full">
			<Form.Control>
				{#snippet children({ props })}
					<FormLabel description="Your display name">Username</FormLabel>
					<Input {...props} bind:value={$formData.username} icon={User} type="text" />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<div class="border-t pt-4">
			<p class="text-muted-foreground mb-4 text-sm">
				Leave password fields empty to keep your current password
			</p>

			<div class="flex flex-col gap-6">
				<Form.Field {form} name="currentPassword" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<FormLabel description="Required to change password">Current Password</FormLabel>
							<Input
								{...props}
								bind:value={$formData.currentPassword}
								icon={Lock}
								type="password"
								autocomplete="current-password"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="newPassword" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<FormLabel description="Minimum 6 characters">New Password</FormLabel>
							<Input
								{...props}
								bind:value={$formData.newPassword}
								icon={Lock}
								type="password"
								autocomplete="new-password"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="confirmPassword" class="w-full">
					<Form.Control>
						{#snippet children({ props })}
							<FormLabel description="Re-enter your new password">Confirm Password</FormLabel>
							<Input
								{...props}
								bind:value={$formData.confirmPassword}
								icon={Lock}
								type="password"
								autocomplete="new-password"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
		</div>

		<SubmitButton {processing} class="w-full">Update Profile</SubmitButton>
	</fieldset>
</form>
