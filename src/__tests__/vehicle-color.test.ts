import { describe, expect, it } from 'vitest';
import { vintageVehicleColor, vehicleTrendColor } from '../lib/domain/vehicle';

describe('vintageVehicleColor', () => {
  it('desaturates a saturated hex toward a muted tone', () => {
    const muted = vintageVehicleColor('#ff0000');
    expect(muted).not.toBeNull();
    expect(muted).not.toBe('#ff0000');
    expect(muted).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('expands 3-digit hex before muting', () => {
    expect(vintageVehicleColor('#f00')).toBe(vintageVehicleColor('#ff0000'));
  });

  it('passes through null/invalid input unchanged', () => {
    expect(vintageVehicleColor(null)).toBeNull();
    expect(vintageVehicleColor(undefined)).toBeNull();
    expect(vintageVehicleColor('not-a-color')).toBe('not-a-color');
  });
});

describe('vehicleTrendColor', () => {
  it('returns null for near-achromatic colors so callers fall back to the theme palette', () => {
    // White, black, silver, gray — none of these can stay visible against both a
    // light and a dark chart background as a single static hex.
    expect(vehicleTrendColor('#f5f5f5')).toBeNull();
    expect(vehicleTrendColor('#1a1a1a')).toBeNull();
    expect(vehicleTrendColor('#c0c0c0')).toBeNull();
    expect(vehicleTrendColor('#808080')).toBeNull();
  });

  it('mutes a saturated color instead of dropping it', () => {
    expect(vehicleTrendColor('#c62828')).toBe(vintageVehicleColor('#c62828'));
    expect(vehicleTrendColor('#c62828')).not.toBeNull();
  });

  it('returns null for missing or invalid input', () => {
    expect(vehicleTrendColor(null)).toBeNull();
    expect(vehicleTrendColor(undefined)).toBeNull();
    expect(vehicleTrendColor('not-a-color')).toBeNull();
  });
});
