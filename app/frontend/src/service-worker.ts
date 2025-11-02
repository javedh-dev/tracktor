/// <reference types="@sveltejs/kit"/>
/// <reference lib="webworker" />
//
// eslint-disable-next-line no-undef
declare let self: ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install service worker
self.addEventListener('install', (event: any) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
});

// Activate serice worker
self.addEventListener('activate', (event: any) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key != CACHE) {
				await caches.delete(key);
			}
		}
	}
	event.waitUntil(deleteOldCaches());
});

// Instercept fetch requests
self.addEventListener('fetch', (event: any) => {
	if (event.request.method !== 'GET') return;

	async function respond() {
		const url = new URL(event.request.url);
		const cache = await caches.open(CACHE);

		// Serve build files and static files from cache
		if (ASSETS.includes(url.pathname)) {
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) {
				return cachedResponse;
			}
		}

		try {
			const response = await fetch(event.request);
			const isNotExt = url.protocol === 'http:';
			const isSuccess = response.status === 200;

			if (isNotExt && isSuccess) {
				cache.put(event.request, response.clone());
			}
			return response;
		} catch {
			// Fallback to cache
			const cachedResponse = await cache.match(url.pathname);
			if (cachedResponse) {
				return cachedResponse;
			}
			return new Response('Not Found', { status: 404 });
		}
	}
	event.respondWith(respond());
});

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
