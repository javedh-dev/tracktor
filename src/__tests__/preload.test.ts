import { expect, it, vi } from 'vitest';
import { handlePreload } from '$server/middlewares/preload';

it('disables optional JS preloads while retaining fonts and CSS (#245, #229)', async () => {
  const response = new Response('page');
  const resolve = vi.fn(async (_event, options) => {
    expect(options.preload({ type: 'js', path: '/chunk.js' })).toBe(false);
    expect(options.preload({ type: 'css', path: '/style.css' })).toBe(true);
    expect(options.preload({ type: 'font', path: '/font.woff2' })).toBe(true);
    return response;
  });
  expect(await handlePreload({ event: {} as any, resolve } as any)).toBe(response);
});
