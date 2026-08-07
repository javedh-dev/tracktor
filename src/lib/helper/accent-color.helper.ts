/**
 * Shared vintage/muted accent palette for decorative icon chips, dots, and badges
 * (StatCard icons, notification types, activity dots, etc). Deliberately desaturated —
 * this is the "no bright colors" counterpart to the semantic --success/--warning/--info/
 * --destructive tokens in app.css, which cover status meaning rather than feature branding.
 *
 * Every value below is a complete, literal Tailwind class string (never built by
 * interpolating a hex variable) so Tailwind's static scanner can find and generate it.
 */
export const ACCENT = {
  moss: {
    gradient: 'bg-gradient-to-br from-[#96a67c] to-[#56643f] shadow-[#74845c]/30',
    chip: 'bg-[#74845c]/10 text-[#74845c]',
    solid: 'bg-[#74845c]',
    soft: 'bg-[#74845c]/10',
    text: 'text-[#74845c]',
    ring: 'border-[#74845c]/40 bg-[#74845c]/10 text-[#74845c]',
    pill: 'bg-[#74845c]/15 text-[#56643f]',
    hoverText: 'text-[#74845c] hover:text-[#56643f]',
    hoverBg: 'hover:bg-[#74845c]/15'
  },
  ochre: {
    gradient: 'bg-gradient-to-br from-[#c9a35b] to-[#8a6a2c] shadow-[#b08a3c]/30',
    chip: 'bg-[#b08a3c]/10 text-[#b08a3c]',
    solid: 'bg-[#b08a3c]',
    soft: 'bg-[#b08a3c]/10',
    text: 'text-[#b08a3c]',
    ring: 'border-[#b08a3c]/40 bg-[#b08a3c]/10 text-[#b08a3c]',
    pill: 'bg-[#b08a3c]/15 text-[#8a6a2c]',
    hoverText: 'text-[#b08a3c] hover:text-[#8a6a2c]',
    hoverBg: 'hover:bg-[#b08a3c]/15',
    medal:
      'bg-gradient-to-br from-[#c9a35b] to-[#b08a3c] text-[#8a6a2c] shadow-sm shadow-[#b08a3c]/30'
  },
  denim: {
    gradient: 'bg-gradient-to-br from-[#7f96a6] to-[#435868] shadow-[#5c7487]/30',
    chip: 'bg-[#5c7487]/10 text-[#5c7487]',
    solid: 'bg-[#5c7487]',
    soft: 'bg-[#5c7487]/10',
    text: 'text-[#5c7487]',
    ring: 'border-[#5c7487]/40 bg-[#5c7487]/10 text-[#5c7487]',
    pill: 'bg-[#5c7487]/15 text-[#435868]',
    hoverText: 'text-[#5c7487] hover:text-[#435868]',
    hoverBg: 'hover:bg-[#5c7487]/15'
  },
  teal: {
    gradient: 'bg-gradient-to-br from-[#82a29e] to-[#486863] shadow-[#5f8783]/30',
    chip: 'bg-[#5f8783]/10 text-[#5f8783]',
    solid: 'bg-[#5f8783]',
    soft: 'bg-[#5f8783]/10',
    text: 'text-[#5f8783]',
    ring: 'border-[#5f8783]/40 bg-[#5f8783]/10 text-[#5f8783]',
    pill: 'bg-[#5f8783]/15 text-[#486863]',
    hoverText: 'text-[#5f8783] hover:text-[#486863]',
    hoverBg: 'hover:bg-[#5f8783]/15'
  },
  plum: {
    gradient: 'bg-gradient-to-br from-[#9c85a0] to-[#5f4c63] shadow-[#816783]/30',
    chip: 'bg-[#816783]/10 text-[#816783]',
    solid: 'bg-[#816783]',
    soft: 'bg-[#816783]/10',
    text: 'text-[#816783]',
    ring: 'border-[#816783]/40 bg-[#816783]/10 text-[#816783]',
    pill: 'bg-[#816783]/15 text-[#5f4c63]',
    hoverText: 'text-[#816783] hover:text-[#5f4c63]',
    hoverBg: 'hover:bg-[#816783]/15'
  },
  brick: {
    gradient: 'bg-gradient-to-br from-[#b47c6e] to-[#784339] shadow-[#9c5a4c]/30',
    chip: 'bg-[#9c5a4c]/10 text-[#9c5a4c]',
    solid: 'bg-[#9c5a4c]',
    soft: 'bg-[#9c5a4c]/10',
    text: 'text-[#9c5a4c]',
    ring: 'border-[#9c5a4c]/40 bg-[#9c5a4c]/10 text-[#9c5a4c]',
    pill: 'bg-[#9c5a4c]/15 text-[#784339]',
    hoverText: 'text-[#9c5a4c] hover:text-[#784339]',
    hoverBg: 'hover:bg-[#9c5a4c]/15'
  },
  fog: {
    gradient: 'bg-gradient-to-br from-[#a19e97] to-[#625f5b] shadow-[#83807a]/30',
    chip: 'bg-[#83807a]/10 text-[#83807a]',
    solid: 'bg-[#83807a]',
    soft: 'bg-[#83807a]/10',
    text: 'text-[#83807a]',
    ring: 'border-[#83807a]/40 bg-[#83807a]/10 text-[#83807a]',
    pill: 'bg-[#83807a]/15 text-[#625f5b]',
    hoverText: 'text-[#83807a] hover:text-[#625f5b]',
    hoverBg: 'hover:bg-[#83807a]/15',
    medal:
      'bg-gradient-to-br from-[#a19e97] to-[#83807a] text-[#3f3d3a] shadow-sm shadow-[#83807a]/30'
  },
  clay: {
    gradient: 'bg-gradient-to-br from-[#cf9b78] to-[#8f5b3d] shadow-[#b97a55]/30',
    chip: 'bg-[#b97a55]/10 text-[#b97a55]',
    solid: 'bg-[#b97a55]',
    soft: 'bg-[#b97a55]/10',
    text: 'text-[#b97a55]',
    ring: 'border-[#b97a55]/40 bg-[#b97a55]/10 text-[#b97a55]',
    pill: 'bg-[#b97a55]/15 text-[#8f5b3d]',
    hoverText: 'text-[#b97a55] hover:text-[#8f5b3d]',
    hoverBg: 'hover:bg-[#b97a55]/15',
    medal:
      'bg-gradient-to-br from-[#cf9b78] to-[#b97a55] text-[#5c3a26] shadow-sm shadow-[#b97a55]/30'
  }
} as const;

export type AccentName = keyof typeof ACCENT;
