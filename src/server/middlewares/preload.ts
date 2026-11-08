import type { Handle } from '@sveltejs/kit';

/** Keep optional module preloads from overflowing reverse-proxy response buffers. */
export const handlePreload: Handle = ({ event, resolve }) =>
  resolve(event, { preload: ({ type }) => type !== 'js' });
