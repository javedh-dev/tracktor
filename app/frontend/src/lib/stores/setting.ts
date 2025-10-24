import type { Config } from '$lib/domain/config';
import { writable } from 'svelte/store';

export const config = writable<Config[]>([]);
