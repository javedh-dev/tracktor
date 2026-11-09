<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';

  import { apiClient } from '$lib/helper/api.helper';
  import { HttpError } from '$lib/helper/http.helper';
  import type { ApiResponse } from '$lib/response';
  import * as m from '$lib/paraglide/messages';
  import { authStore } from '$stores/auth.svelte';
  import { vehicleStore } from '$stores/vehicle.svelte';
  import * as Alert from '$ui/alert';
  import { Button } from '$ui/button';
  import * as Card from '$ui/card';
  import { Checkbox } from '$ui/checkbox';
  import * as Field from '$ui/field';
  import { Input } from '$ui/input';
  import * as Select from '$ui/select';

  type Role = 'admin' | 'driver';
  type ManagedUser = {
    id: string;
    username: string;
    role: Role;
    isActive: boolean;
    vehicleIds: string[];
  };

  let users = $state<ManagedUser[]>([]);
  let username = $state('');
  let password = $state('');
  let role = $state<Role>('driver');
  let passwords = $state<Record<string, string>>({});
  let loading = $state(true);
  let busy = $state(false);
  let errorMessage = $state('');

  const vehicles = $derived(
    (vehicleStore.vehicles ?? []).flatMap((vehicle) =>
      vehicle.id ? [{ ...vehicle, id: vehicle.id }] : []
    )
  );

  const roles = $derived([
    { value: 'driver', label: m.users_driver() },
    { value: 'admin', label: m.users_admin() }
  ]);

  onMount(() => {
    void loadUsers().catch(showError);
  });

  function showError(error: unknown) {
    const payload: unknown = error instanceof HttpError ? error.response?.data : undefined;
    errorMessage =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : m.users_error();
    toast.error(errorMessage);
  }

  async function loadUsers() {
    loading = true;
    try {
      const { data } = await apiClient.get<ApiResponse<ManagedUser[]>>('/users');
      if (!data.success || !data.data) throw new Error(m.users_error());
      users = data.data;
    } finally {
      loading = false;
    }
  }

  async function perform(action: () => Promise<void>) {
    if (busy) return;
    busy = true;
    errorMessage = '';
    try {
      await action();
      toast.success(m.users_saved());
    } catch (error) {
      showError(error);
    } finally {
      busy = false;
    }
  }

  function createUser() {
    return perform(async () => {
      await apiClient.post('/users', { username, password, role });
      username = '';
      password = '';
      role = 'driver';
      await loadUsers();
    });
  }

  function saveUser(user: ManagedUser) {
    return perform(async () => {
      // These independent endpoints may partially succeed; refresh after a failure.
      try {
        await apiClient.put(`/users/${encodeURIComponent(user.id)}/vehicles`, {
          vehicleIds: user.vehicleIds
        });
        await apiClient.patch(`/users/${encodeURIComponent(user.id)}`, {
          role: user.role,
          isActive: user.isActive
        });
      } catch (error) {
        await loadUsers().catch(() => {});
        throw error;
      } finally {
        await authStore.checkAuthStatus();
      }
    });
  }

  function resetPassword(user: ManagedUser) {
    return perform(async () => {
      await apiClient.post(`/users/${encodeURIComponent(user.id)}/password`, {
        password: passwords[user.id]
      });
      passwords[user.id] = '';
      await authStore.checkAuthStatus();
    });
  }

  function setVehicle(user: ManagedUser, vehicleId: string, checked: boolean) {
    user.vehicleIds = checked
      ? [...new Set([...user.vehicleIds, vehicleId])]
      : user.vehicleIds.filter((id) => id !== vehicleId);
  }
</script>

<div class="flex flex-col gap-6" aria-busy={loading || busy}>
  {#if errorMessage}
    <Alert.Root variant="destructive">
      <Alert.Title>{m.users_error()}</Alert.Title>
      <Alert.Description>{errorMessage}</Alert.Description>
    </Alert.Root>
  {/if}

  {#if authStore.localAuthEnabled}
    <form
      onsubmit={(event) => {
        event.preventDefault();
        void createUser();
      }}
    >
      <Card.Root>
        <Card.Header>
          <Card.Title>{m.users_create()}</Card.Title>
          <Card.Description>{m.users_description()}</Card.Description>
        </Card.Header>
        <Card.Content>
          <Field.FieldSet disabled={loading || busy}>
            <Field.FieldGroup>
              <Field.Field>
                <Field.FieldLabel for="managed-user-username">{m.users_username()}</Field.FieldLabel
                >
                <Input
                  id="managed-user-username"
                  bind:value={username}
                  autocomplete="off"
                  minlength={3}
                  maxlength={128}
                  required
                />
              </Field.Field>
              <Field.Field>
                <Field.FieldLabel for="managed-user-password">{m.users_password()}</Field.FieldLabel
                >
                <Input
                  id="managed-user-password"
                  type="password"
                  bind:value={password}
                  autocomplete="new-password"
                  minlength={6}
                  maxlength={72}
                  required
                />
              </Field.Field>
              <Field.Field>
                <Field.FieldLabel for="managed-user-role">{m.users_role()}</Field.FieldLabel>
                <Select.Root
                  type="single"
                  value={role}
                  onValueChange={(value) => {
                    if (value === 'admin' || value === 'driver') role = value;
                  }}
                  disabled={loading || busy}
                >
                  <Select.Trigger id="managed-user-role" class="w-full">
                    {role === 'admin' ? m.users_admin() : m.users_driver()}
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Group>
                      {#each roles as option (option.value)}
                        <Select.Item value={option.value} label={option.label}
                          >{option.label}</Select.Item
                        >
                      {/each}
                    </Select.Group>
                  </Select.Content>
                </Select.Root>
              </Field.Field>
            </Field.FieldGroup>
          </Field.FieldSet>
        </Card.Content>
        <Card.Footer>
          <Button type="submit" disabled={loading || busy}>{m.users_create()}</Button>
        </Card.Footer>
      </Card.Root>
    </form>
  {/if}

  {#if loading}
    <p role="status">{m.common_loading()}</p>
  {:else}
    {#each users as user, index (user.id)}
      <Card.Root>
        <Card.Header>
          <Card.Title><h3>{user.username}</h3></Card.Title>
          <Card.Description
            >{user.role === 'admin' ? m.users_admin() : m.users_driver()}</Card.Description
          >
        </Card.Header>
        <Card.Content class="flex flex-col gap-6">
          <form
            onsubmit={(event) => {
              event.preventDefault();
              void saveUser(user);
            }}
          >
            <Field.FieldSet disabled={busy}>
              <Field.FieldGroup>
                <Field.Field>
                  <Field.FieldLabel for={`managed-role-${user.id}`}
                    >{m.users_role()}</Field.FieldLabel
                  >
                  <Select.Root
                    type="single"
                    value={user.role}
                    onValueChange={(value) => {
                      if (value === 'admin' || value === 'driver') users[index].role = value;
                    }}
                    disabled={busy}
                  >
                    <Select.Trigger id={`managed-role-${user.id}`} class="w-full">
                      {user.role === 'admin' ? m.users_admin() : m.users_driver()}
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {#each roles as option (option.value)}
                          <Select.Item value={option.value} label={option.label}
                            >{option.label}</Select.Item
                          >
                        {/each}
                      </Select.Group>
                    </Select.Content>
                  </Select.Root>
                </Field.Field>
                <Field.Field orientation="horizontal">
                  <Checkbox
                    id={`managed-active-${user.id}`}
                    bind:checked={users[index].isActive}
                    disabled={busy}
                  />
                  <Field.FieldLabel for={`managed-active-${user.id}`}
                    >{m.users_active()}</Field.FieldLabel
                  >
                </Field.Field>
                {#if user.role === 'driver'}
                  <Field.FieldSet>
                    <Field.FieldLegend>{m.users_vehicles()}</Field.FieldLegend>
                    <Field.FieldGroup>
                      {#each vehicles as vehicle (vehicle.id)}
                        <Field.Field orientation="horizontal">
                          <Checkbox
                            id={`managed-vehicle-${user.id}-${vehicle.id}`}
                            checked={user.vehicleIds.includes(vehicle.id)}
                            onCheckedChange={(checked) => setVehicle(user, vehicle.id, checked)}
                            disabled={busy}
                          />
                          <Field.FieldLabel for={`managed-vehicle-${user.id}-${vehicle.id}`}>
                            {vehicle.make}
                            {vehicle.model}{vehicle.licensePlate
                              ? ` (${vehicle.licensePlate})`
                              : ''}
                          </Field.FieldLabel>
                        </Field.Field>
                      {:else}
                        <p class="text-muted-foreground text-sm">{m.widget_no_vehicles_yet()}</p>
                      {/each}
                    </Field.FieldGroup>
                  </Field.FieldSet>
                {/if}
                <Field.Field>
                  <Button type="submit" disabled={busy}>{m.users_save()}</Button>
                </Field.Field>
              </Field.FieldGroup>
            </Field.FieldSet>
          </form>
          {#if authStore.localAuthEnabled}
            <form
              onsubmit={(event) => {
                event.preventDefault();
                void resetPassword(user);
              }}
            >
              <Field.FieldSet disabled={busy}>
                <Field.FieldGroup>
                  <Field.Field>
                    <Field.FieldLabel for={`managed-password-${user.id}`}
                      >{m.users_password()}</Field.FieldLabel
                    >
                    <Input
                      id={`managed-password-${user.id}`}
                      type="password"
                      bind:value={passwords[user.id]}
                      autocomplete="new-password"
                      minlength={6}
                      maxlength={72}
                      required
                    />
                  </Field.Field>
                  <Field.Field>
                    <Button type="submit" variant="outline" disabled={busy}
                      >{m.users_reset_password()}</Button
                    >
                  </Field.Field>
                </Field.FieldGroup>
              </Field.FieldSet>
            </form>
          {/if}
        </Card.Content>
      </Card.Root>
    {/each}
  {/if}
</div>
