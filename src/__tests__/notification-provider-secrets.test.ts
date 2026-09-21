import { describe, it, expect, beforeAll } from 'vitest';
import { migrate } from 'drizzle-orm/libsql/migrator';
import type { RequestEvent } from '@sveltejs/kit';
import { db } from '../server/db/index';
import {
  GET as listProviders,
  POST as createProvider
} from '../routes/api/notification-providers/+server';
import {
  GET as getProviderById,
  PUT as updateProvider
} from '../routes/api/notification-providers/[id]/+server';
import * as providerService from '../server/services/notificationProviderService';

// Exercises the REAL route handlers (not a reimplementation) to check the fix for "secrets de
// proveedores de notificación expuestos en claro": a network capture of GET
// /api/notification-providers (or of the other mutating endpoints) must contain no plaintext
// secret. This calls the actual GET/POST/PUT handlers from the +server.ts files with a minimal
// fake RequestEvent, the same way rate-limit.test.ts exercises handleRateLimit directly.

beforeAll(async () => {
  await migrate(db, {
    migrationsFolder: 'src/server/db/migrations',
    migrationsTable: '_migrations'
  });
});

function makeEvent(opts: { method?: string; body?: unknown; id?: string }): RequestEvent {
  const { method = 'GET', body, id } = opts;

  return {
    request: new Request('http://localhost/api/notification-providers', {
      method,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    }),
    params: id !== undefined ? { id } : {}
  } as unknown as RequestEvent;
}

const emailPayload = {
  name: 'SMTP relay',
  type: 'email',
  isEnabled: true,
  channels: ['alert'],
  config: {
    type: 'email',
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: { user: 'bot@example.com', pass: 'SuperSecretSmtpPass!1' },
    from: 'bot@example.com'
  }
};

const gotifyPayload = {
  name: 'Gotify server',
  type: 'gotify',
  isEnabled: true,
  channels: ['alert'],
  config: {
    type: 'gotify',
    serverUrl: 'https://gotify.example.com',
    appToken: 'SuperSecretGotifyToken99',
    priority: 5
  }
};

const webhookPayload = {
  name: 'Webhook basic auth',
  type: 'webhook',
  isEnabled: true,
  channels: ['alert'],
  config: {
    type: 'webhook',
    url: 'https://hooks.example.com/notify',
    method: 'POST',
    authType: 'basic',
    authCredentials: { username: 'hookuser', password: 'SuperSecretWebhookPass!2' }
  }
};

async function bodyOf(response: Response) {
  return response.json();
}

describe('notification provider secrets masking (fix for plaintext-secret-exposure finding)', () => {
  it('POST response does not contain the plaintext secret, but does keep non-secret fields', async () => {
    const response = await createProvider(makeEvent({ method: 'POST', body: emailPayload }));
    const body = await bodyOf(response);
    const raw = JSON.stringify(body);

    expect(raw).not.toContain('SuperSecretSmtpPass!1');
    expect(body.data.config.auth.pass).toBe('');
    expect(body.data.config.auth.user).toBe('bot@example.com'); // non-secret, must survive
    expect(body.data.config.host).toBe('smtp.example.com');
  });

  it('GET list response does not contain any plaintext secret for any provider type', async () => {
    await createProvider(makeEvent({ method: 'POST', body: gotifyPayload }));
    await createProvider(makeEvent({ method: 'POST', body: webhookPayload }));

    const response = await listProviders(makeEvent({ method: 'GET' }));
    const body = await bodyOf(response);
    const raw = JSON.stringify(body);

    expect(raw).not.toContain('SuperSecretSmtpPass!1');
    expect(raw).not.toContain('SuperSecretGotifyToken99');
    expect(raw).not.toContain('SuperSecretWebhookPass!2');

    expect(body.data.length).toBeGreaterThanOrEqual(3);

    for (const provider of body.data) {
      if (provider.config.type === 'email') expect(provider.config.auth.pass).toBe('');
      if (provider.config.type === 'gotify') expect(provider.config.appToken).toBe('');
      if (provider.config.type === 'webhook' && provider.config.authCredentials) {
        expect(provider.config.authCredentials.password ?? '').toBe('');
        // non-secret identifier must survive so the edit form can still show it
        expect(provider.config.authCredentials.username).toBe('hookuser');
      }
    }
  });

  it('GET by id response does not contain the plaintext secret', async () => {
    const created = await bodyOf(
      await createProvider(makeEvent({ method: 'POST', body: emailPayload }))
    );
    const id = created.data.id;

    const response = await getProviderById(makeEvent({ method: 'GET', id }));
    const body = await bodyOf(response);
    const raw = JSON.stringify(body);

    expect(raw).not.toContain('SuperSecretSmtpPass!1');
    expect(body.data.config.auth.pass).toBe('');
  });

  it('PUT response does not contain the plaintext secret, and saving with the masked (empty) secret preserves the real one in the DB', async () => {
    const created = await bodyOf(
      await createProvider(makeEvent({ method: 'POST', body: emailPayload }))
    );
    const id = created.data.id;

    // Simulate the real edit flow: the client only ever sees the masked ('') secret (per the
    // GET tests above) and, per EmailProviderForm.svelte, never pre-fills auth.pass from it —
    // so a save without touching the password field resubmits an empty pass, exactly like this.
    const updatePayload = {
      name: 'SMTP relay (renamed)',
      config: {
        type: 'email',
        host: 'smtp.example.com',
        port: 2525,
        secure: true,
        auth: { user: 'bot@example.com', pass: '' },
        from: 'bot@example.com'
      }
    };

    const putResponse = await updateProvider(makeEvent({ method: 'PUT', id, body: updatePayload }));
    const putBody = await bodyOf(putResponse);
    const putRaw = JSON.stringify(putBody);

    expect(putRaw).not.toContain('SuperSecretSmtpPass!1');
    expect(putBody.data.config.auth.pass).toBe('');
    expect(putBody.data.name).toBe('SMTP relay (renamed)');
    expect(putBody.data.config.port).toBe(2525); // the actual edit took effect

    // Verify against the REAL decrypted DB record (bypassing masking) that the original
    // secret was preserved, not overwritten with the empty string that was submitted.
    const realProvider = await providerService.getProviderById(id);
    expect(realProvider.config.type).toBe('email');
    if (realProvider.config.type === 'email') {
      expect(realProvider.config.auth.pass).toBe('SuperSecretSmtpPass!1');
    }
  });

  it('the internal service functions (used by the real test-notification flow) still return the real, unmasked secret', async () => {
    const created = await bodyOf(
      await createProvider(makeEvent({ method: 'POST', body: gotifyPayload }))
    );
    const id = created.data.id;

    // getProviderById() from the service layer (not the route) is what
    // /api/notification-providers/[id]/test/+server.ts calls to actually send a test
    // notification — it must keep receiving the real secret, or notifications would break.
    const realProvider = await providerService.getProviderById(id);
    expect(realProvider.config.type).toBe('gotify');
    if (realProvider.config.type === 'gotify') {
      expect(realProvider.config.appToken).toBe('SuperSecretGotifyToken99');
    }
  });
});
