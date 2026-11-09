// Real, disposable Authentik fixture for Tracktor's OIDC smoke test.
// Usage: node scripts/test-authentik-oidc.mjs --prepare | --test [--keep] | --test-oidc-only [--keep] | --cleanup
import process from 'node:process';
import console from 'node:console';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';

const { fetch, AbortSignal } = globalThis;
const run = promisify(execFile);
const composeFile = fileURLToPath(new URL('./oidc-smoke.compose.yml', import.meta.url));
const statePath = resolve(process.env.TRACKTOR_OIDC_SMOKE_STATE || '/tmp/tracktor-oidc-smoke.json');
const issuerOrigin = 'http://127.0.0.1:19000';
const appOrigin = 'http://127.0.0.1:5189';
const bootstrapToken = 'tracktor-smoke-bootstrap-token-0123456789abcdef';
const providerPassword = 'tracktor-smoke-admin-password';
const marker = 'tracktor-authentik-smoke-v1';
const mode = process.argv[2] || '--test';
const keepFixture = process.argv.includes('--keep');
if (!['--prepare', '--test', '--test-oidc-only', '--cleanup'].includes(mode)) {
  throw new Error('Usage: --prepare | --test [--keep] | --test-oidc-only [--keep] | --cleanup');
}

let pendingProject;
let terminating = false;
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    if (terminating) return;
    terminating = true;
    try {
      if (pendingProject) await compose(pendingProject, ['down', '--volumes', '--remove-orphans']);
      else if (mode.startsWith('--test') && !keepFixture) await cleanup();
    } finally {
      process.exit(signal === 'SIGINT' ? 130 : 143);
    }
  });
}

async function compose(project, args) {
  if (!/^tracktor-oidc-smoke-[a-z0-9-]+$/.test(project)) throw new Error('Invalid fixture project');
  await run(
    'docker',
    ['compose', '--env-file', '/dev/null', '-p', project, '-f', composeFile, ...args],
    {
      maxBuffer: 1024 * 1024
    }
  );
}

async function api(path, method = 'GET', body) {
  const response = await fetch(`${issuerOrigin}/api/v3/${path}`, {
    method,
    headers: { Authorization: `Bearer ${bootstrapToken}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok)
    throw new Error(`Authentik ${method} ${path}: ${response.status} ${JSON.stringify(data)}`);
  return data;
}

async function waitForBootstrap() {
  const deadline = Date.now() + 240000;
  while (Date.now() < deadline) {
    try {
      const flows = await api('flows/instances/?page_size=100');
      if (
        flows.results.some(
          (flow) => flow.slug === 'default-provider-authorization-implicit-consent'
        ) &&
        flows.results.some((flow) => flow.slug === 'default-provider-invalidation-flow')
      )
        return flows.results;
    } catch {
      // Initial migrations and blueprint/bootstrap application can take a few minutes.
    }
    await sleep(2000);
  }
  throw new Error('Authentik did not finish its bootstrap within 240 seconds');
}

async function prepare() {
  try {
    await readFile(statePath);
    throw new Error(`Fixture state already exists: ${statePath}; use --cleanup first`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const project = `tracktor-oidc-smoke-${randomUUID().slice(0, 8)}`;
  const state = { marker, project, composeFile, issuerOrigin, appOrigin };
  let keep = false;
  pendingProject = project;
  try {
    console.log(`Starting disposable Authentik project ${project}`);
    await compose(project, ['up', '-d', '--pull', 'never']);
    const flows = await waitForBootstrap();
    const mappings = (await api('propertymappings/provider/scope/?page_size=100')).results;
    const signingKeys = (await api('crypto/certificatekeypairs/?has_key=true&page_size=100'))
      .results;
    const signingKey =
      signingKeys.find((key) => key.name === 'authentik Self-signed Certificate') || signingKeys[0];
    if (!signingKey) throw new Error('Default Authentik signing key was not created');
    const scopes = mappings.filter((mapping) =>
      ['openid', 'profile', 'email'].includes(mapping.scope_name)
    );
    if (scopes.length !== 3) throw new Error('Default OIDC scope mappings were not created');
    const provider = await api('providers/oauth2/', 'POST', {
      name: 'Tracktor smoke',
      authorization_flow: flows.find(
        (flow) => flow.slug === 'default-provider-authorization-implicit-consent'
      ).pk,
      invalidation_flow: flows.find((flow) => flow.slug === 'default-provider-invalidation-flow')
        .pk,
      grant_types: ['authorization_code'],
      client_type: 'confidential',
      client_id: 'tracktor-smoke',
      client_secret: 'tracktor-smoke-client-secret',
      redirect_uris: [{ matching_mode: 'strict', url: `${appOrigin}/api/auth/oidc/callback` }],
      property_mappings: scopes.map((mapping) => mapping.pk),
      signing_key: signingKey.pk,
      sub_mode: 'hashed_user_id',
      issuer_mode: 'per_provider'
    });
    await api('core/applications/', 'POST', {
      name: 'Tracktor smoke',
      slug: 'tracktor-smoke',
      provider: provider.pk,
      policy_engine_mode: 'any'
    });
    state.env = {
      NODE_ENV: 'test',
      OIDC_ENABLED: 'true',
      OIDC_ISSUER: `${issuerOrigin}/application/o/tracktor-smoke/`,
      OIDC_CLIENT_ID: 'tracktor-smoke',
      OIDC_CLIENT_SECRET: 'tracktor-smoke-client-secret',
      OIDC_REDIRECT_URI: `${appOrigin}/api/auth/oidc/callback`,
      OIDC_SCOPES: 'openid profile email',
      OIDC_DISABLE_LOCAL_AUTH: 'false'
    };
    await writeFile(statePath, JSON.stringify(state, null, 2), { mode: 0o600 });
    const envPath = statePath.replace(/\.json$/, '') + '.env';
    await writeFile(
      envPath,
      Object.entries(state.env)
        .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
        .join('\n') + '\n',
      { mode: 0o600 }
    );
    keep = true;
    console.log(`Fixture ready: ${statePath}`);
    console.log(`Synthetic app environment: ${envPath}`);
    console.log(
      `Run Tracktor at ${appOrigin}, then run this script with --test; finally run --cleanup.`
    );
  } finally {
    if (!keep) {
      await compose(project, ['down', '--volumes', '--remove-orphans']);
      await rm(statePath, { force: true });
      await rm(statePath.replace(/\.json$/, '') + '.env', { force: true });
    }
    pendingProject = undefined;
  }
}

async function loadState() {
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  if (state.marker !== marker || state.composeFile !== composeFile)
    throw new Error('Not this smoke fixture');
  return state;
}

async function cleanup() {
  const state = await loadState();
  await compose(state.project, ['down', '--volumes', '--remove-orphans']);
  await rm(statePath, { force: true });
  await rm(statePath.replace(/\.json$/, '') + '.env', { force: true });
  console.log('Removed disposable Authentik containers, network, and database volume.');
}

class Browser {
  cookies = new Map();
  callbacks = [];

  async request(input, method = 'GET', body) {
    const url = new URL(input);
    assert.ok([issuerOrigin, appOrigin].includes(url.origin), 'Unexpected smoke redirect origin');
    const headers = { Accept: 'application/json' };
    const applicable = [...this.cookies.values()].filter(
      (cookie) => cookie.host === url.hostname && url.pathname.startsWith(cookie.path)
    );
    if (applicable.length)
      headers.Cookie = applicable.map((cookie) => `${cookie.name}=${cookie.value}`).join('; ');
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (method !== 'GET' && url.origin === issuerOrigin) {
      headers['X-CSRFToken'] = this.cookies.get(`${url.hostname}:authentik_csrf`)?.value || '';
      headers.Referer = `${issuerOrigin}/if/flow/default-authentication-flow/`;
      headers.Origin = issuerOrigin;
    }
    const response = await fetch(url, {
      method,
      headers,
      redirect: 'manual',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000)
    });
    for (const header of response.headers.getSetCookie()) {
      const [pair, ...attributes] = header.split(';');
      const equal = pair.indexOf('=');
      const cookie = {
        name: pair.slice(0, equal),
        value: pair.slice(equal + 1),
        host: url.hostname,
        path: '/'
      };
      for (const attribute of attributes) {
        if (attribute.trim().toLowerCase().startsWith('path='))
          cookie.path = attribute.trim().slice(5);
      }
      const key = `${cookie.host}:${cookie.name}`;
      if (attributes.some((attribute) => attribute.trim().toLowerCase() === 'max-age=0'))
        this.cookies.delete(key);
      else this.cookies.set(key, cookie);
    }
    if (url.origin === appOrigin && url.pathname === '/api/auth/oidc/callback')
      this.callbacks.push(url.href);
    return { response, url };
  }

  async follow(input, method = 'GET', body) {
    let result = await this.request(input, method, body);
    for (let hop = 0; hop < 20; hop++) {
      const location = result.response.headers.get('location');
      if (result.response.status < 300 || result.response.status >= 400 || !location) return result;
      result = await this.request(new URL(location, result.url).href);
    }
    throw new Error('Too many smoke redirects');
  }

  async json(path, method = 'GET', body) {
    const { response } = await this.request(`${appOrigin}${path}`, method, body);
    const data = await response.json();
    assert.ok(
      response.ok,
      `Tracktor ${method} ${path} returned ${response.status}: ${JSON.stringify(data)}`
    );
    return data.data;
  }
}

async function loginProvider(browser, username) {
  const endpoint = `${issuerOrigin}/api/v3/flows/executor/default-authentication-flow/?query=next%3D%252F`;
  let { response } = await browser.follow(endpoint);
  let challenge = await response.json();
  for (let step = 0; step < 8; step++) {
    if (challenge.component === 'xak-flow-redirect') return;
    let answer;
    if (challenge.component === 'ak-stage-identification') answer = { uid_field: username };
    else if (challenge.component === 'ak-stage-password') answer = { password: providerPassword };
    else throw new Error(`Unexpected Authentik login stage: ${challenge.component}`);
    ({ response } = await browser.follow(endpoint, 'POST', answer));
    challenge = await response.json();
    if (challenge.response_errors && Object.keys(challenge.response_errors).length) {
      throw new Error(
        `Authentik rejected synthetic login: ${JSON.stringify(challenge.response_errors)}`
      );
    }
  }
  throw new Error('Authentik login did not complete');
}

async function authorize(browser, location) {
  let result = await browser.follow(location);
  for (let step = 0; step < 8; step++) {
    if (result.url.origin === appOrigin) {
      assert.equal(result.url.pathname, '/dashboard', 'OIDC callback must reach dashboard');
      assert.notEqual(result.url.searchParams.get('oidc'), 'error');
      return result;
    }
    const match = result.url.pathname.match(/^\/if\/flow\/([^/]+)\//);
    if (!match) throw new Error(`Unexpected authorization page: ${result.url.pathname}`);
    const endpoint = `${issuerOrigin}/api/v3/flows/executor/${match[1]}/?query=${encodeURIComponent(result.url.search.slice(1))}`;
    let flow = await browser.follow(endpoint);
    let challenge = await flow.response.json();
    if (challenge.component === 'ak-stage-consent') {
      flow = await browser.follow(endpoint, 'POST', { consent: true });
      challenge = await flow.response.json();
    }
    if (challenge.component !== 'xak-flow-redirect' || typeof challenge.to !== 'string') {
      throw new Error(`Unexpected authorization stage: ${challenge.component}`);
    }
    result = await browser.follow(new URL(challenge.to, issuerOrigin).href);
  }
  throw new Error('OIDC authorization did not complete');
}

async function ensureLinkIdentity() {
  const username = 'tracktor-link-admin';
  const found = (await api(`core/users/?username=${username}`)).results.find(
    (user) => user.username === username
  );
  const user =
    found ||
    (await api('core/users/', 'POST', {
      username,
      name: 'Tracktor linked admin',
      email: 'tracktor-link-admin@example.test',
      is_active: true,
      type: 'internal',
      groups: [],
      attributes: {}
    }));
  await api(`core/users/${user.pk}/set_password/`, 'POST', { password: providerPassword });
  return username;
}

async function smoke() {
  await loadState();
  try {
    const local = new Browser();
    const status = await local.json('/api/auth');
    assert.equal(status.isAuthDisabled, false, 'Smoke test requires authentication enabled');
    const username = process.env.TRACKTOR_SMOKE_LOCAL_USER || 'tracktor-smoke-admin';
    const password = process.env.TRACKTOR_SMOKE_LOCAL_PASSWORD || 'tracktor-smoke-local-password';
    if (!status.hasUsers) await local.json('/api/auth/register', 'POST', { username, password });
    await local.json('/api/auth', 'POST', { username, password });
    const localAdmin = (await local.json('/api/auth')).user;
    assert.equal(localAdmin.role, 'admin');

    const sso = new Browser();
    await loginProvider(sso, 'akadmin');
    const begin = await sso.request(`${appOrigin}/api/auth/oidc/login`);
    assert.equal(begin.response.status, 302);
    await authorize(sso, new URL(begin.response.headers.get('location'), appOrigin).href);
    const driver = (await sso.json('/api/auth')).user;
    assert.equal(driver.role, 'driver');
    assert.notEqual(driver.id, localAdmin.id);
    assert.deepEqual(await sso.json('/api/vehicles'), []);
    console.log(
      'PASS real Authentik discovery, PKCE exchange, verified ID token, Driver provisioning, and Tracktor session'
    );

    const replay = new Browser();
    const replayResponse = await replay.request(sso.callbacks[0]);
    assert.equal(replayResponse.response.status, 302);
    const replayLocation = new URL(replayResponse.response.headers.get('location'), appOrigin);
    assert.equal(replayLocation.pathname, '/login');
    assert.equal(replayLocation.searchParams.get('oidc'), 'error');
    assert.equal((await replay.json('/api/auth')).isAuthenticated, false);
    console.log('PASS callback replay rejected without a new session');

    await loginProvider(local, await ensureLinkIdentity());
    const link = await local.request(`${appOrigin}/api/auth/oidc/link`, 'POST');
    assert.equal(link.response.status, 303);
    const linked = await authorize(
      local,
      new URL(link.response.headers.get('location'), appOrigin).href
    );
    assert.equal(linked.url.searchParams.get('oidc'), 'linked');
    assert.equal((await local.json('/api/auth')).user.id, localAdmin.id);
    const identities = await local.json('/api/users');
    assert.equal(identities.filter((user) => user.id === localAdmin.id).length, 1);
    console.log('PASS explicit linking retains local administrator identity and session');

    await local.json('/api/auth', 'DELETE');
    const linkedLogin = await local.request(`${appOrigin}/api/auth/oidc/login`);
    assert.equal(linkedLogin.response.status, 302);
    await authorize(local, new URL(linkedLogin.response.headers.get('location'), appOrigin).href);
    assert.equal((await local.json('/api/auth')).user.id, localAdmin.id);
    console.log('PASS linked identity signs in as the existing administrator');
  } finally {
    if (!keepFixture) await cleanup();
  }
}

async function smokeOidcOnly() {
  await loadState();
  try {
    const browser = new Browser();
    assert.equal((await browser.json('/api/auth')).localAuthEnabled, false);
    for (const path of ['/api/auth', '/api/auth/register']) {
      const result = await browser.request(`${appOrigin}${path}`, 'POST', {
        username: 'tracktor-smoke-admin',
        password: 'tracktor-smoke-local-password'
      });
      assert.equal(result.response.status, 403, `${path} must reject local authentication`);
    }
    await loginProvider(browser, 'tracktor-link-admin');
    const begin = await browser.request(`${appOrigin}/api/auth/oidc/login`);
    assert.equal(begin.response.status, 302);
    await authorize(browser, new URL(begin.response.headers.get('location'), appOrigin).href);
    const admin = (await browser.json('/api/auth')).user;
    assert.equal(admin.username, 'tracktor-smoke-admin');
    assert.equal(admin.role, 'admin');
    const password = await browser.request(`${appOrigin}/api/auth/profile`, 'PUT', {
      currentPassword: 'tracktor-smoke-local-password',
      newPassword: 'replacement-smoke-password'
    });
    assert.equal(password.response.status, 403);
    const reset = await browser.request(`${appOrigin}/api/users/${admin.id}/password`, 'POST', {
      password: 'replacement-smoke-password'
    });
    assert.equal(reset.response.status, 403);
    for (const update of [{ role: 'driver' }, { isActive: false }]) {
      const result = await browser.request(`${appOrigin}/api/users/${admin.id}`, 'PATCH', update);
      assert.equal(result.response.status, 409, 'Final linked administrator must remain available');
    }
    console.log(
      'PASS OIDC-only: local login/registration/password changes denied; linked administrator SSO works; final linked administrator protected'
    );
  } finally {
    if (!keepFixture) await cleanup();
  }
}

if (mode === '--prepare') await prepare();
if (mode === '--test') await smoke();
if (mode === '--test-oidc-only') await smokeOidcOnly();
if (mode === '--cleanup') await cleanup();
