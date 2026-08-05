import { describe, expect, it, vi } from 'vitest';

vi.mock('fs/promises', () => ({ writeFile: vi.fn().mockResolvedValue(undefined) }));

import { POST } from '../routes/api/files/+server';

describe('POST /api/files', () => {
  it('returns the filename where uploadFile() reads it (res.data.filename)', async () => {
    const body = new FormData();
    body.append('file', new File(['x'], 'car.png', { type: 'image/png' }));

    const response = await POST({
      request: new Request('http://localhost/api/files', { method: 'POST', body })
    } as Parameters<typeof POST>[0]);

    const payload = await response.json();
    expect(payload.data.filename).toMatch(/car\.png$/);
  });
});
