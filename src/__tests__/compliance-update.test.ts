import { beforeEach, expect, it, vi } from 'vitest';

const existing = {
  id: 'document-id',
  vehicleId: '123e4567-e89b-42d3-a456-426614174000',
  type: 'insurance',
  otherLabel: null,
  documentNumber: 'AB123',
  issuer: 'Insurer',
  startDate: '2026-08-13',
  endDate: '2027-08-13',
  recurrenceType: 'none',
  recurrenceInterval: 1,
  cost: null,
  notes: null,
  attachment: 'invoice.pdf'
};
const service = vi.hoisted(() => ({
  getComplianceDocumentById: vi.fn(),
  updateComplianceDocument: vi.fn()
}));
vi.mock('$server/services/complianceService', () => service);
vi.mock('$server/config/logger', () => ({ default: { error: vi.fn() } }));
import { PUT } from '../routes/api/vehicles/[id]/compliance/[complianceId]/+server';

beforeEach(() => {
  vi.clearAllMocks();
  service.getComplianceDocumentById.mockResolvedValue(existing);
  service.updateComplianceDocument.mockImplementation(async (_v, _id, body) => body);
});

it('updates a refined compliance schema and preserves omitted fields (#242)', async () => {
  const response = await PUT({
    params: { id: existing.vehicleId, complianceId: existing.id },
    request: new Request('http://localhost/api/compliance', {
      method: 'PUT',
      body: JSON.stringify({ issuer: 'Updated insurer' })
    })
  } as any);
  expect(response.status).toBe(200);
  expect(service.updateComplianceDocument).toHaveBeenCalledWith(
    existing.vehicleId,
    existing.id,
    expect.objectContaining({ issuer: 'Updated insurer', attachment: 'invoice.pdf' })
  );
});

it('retains the other-type label invariant on partial updates', async () => {
  service.getComplianceDocumentById.mockResolvedValue({
    ...existing,
    type: 'other',
    otherLabel: 'Warranty'
  });
  await expect(
    PUT({
      params: { id: existing.vehicleId, complianceId: existing.id },
      request: new Request('http://localhost/api/compliance', {
        method: 'PUT',
        body: JSON.stringify({ otherLabel: '' })
      })
    } as any)
  ).rejects.toMatchObject({ status: 400 });
  expect(service.updateComplianceDocument).not.toHaveBeenCalled();
});
