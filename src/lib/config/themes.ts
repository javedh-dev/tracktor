import type { ThemeConfig } from '$lib/types/theme';
import * as m from '$lib/paraglide/messages';

export const themes: Record<string, ThemeConfig> = {
	slate: {
		name: 'slate',
		get label() {
			return m.theme_slate();
		},
		active: false,
		colors: {
			primary: 'oklch(0.356 0.011 252.894)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.356 0.011 252.894)'
		},
		darkColors: {
			primary: 'oklch(0.876 0.015 252.894)',
			primaryForeground: 'oklch(0.145 0.001 247.858)',
			ring: 'oklch(0.876 0.015 252.894)'
		}
	},
	stone: {
		name: 'stone',
		get label() {
			return m.theme_stone();
		},
		active: false,
		colors: {
			primary: 'oklch(0.38 0.005 60)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.38 0.005 60)'
		},
		darkColors: {
			primary: 'oklch(0.88 0.005 60)',
			primaryForeground: 'oklch(0.145 0 0)',
			ring: 'oklch(0.88 0.005 60)'
		}
	},
	red: {
		name: 'red',
		get label() {
			return m.theme_red();
		},
		active: false,
		colors: {
			primary: 'oklch(0.577 0.245 27.325)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.577 0.245 27.325)'
		},
		darkColors: {
			primary: 'oklch(0.677 0.245 27.325)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.677 0.245 27.325)'
		}
	},
	rose: {
		name: 'rose',
		get label() {
			return m.theme_rose();
		},
		active: false,
		colors: {
			primary: 'oklch(0.643 0.181 19.301)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.643 0.181 19.301)'
		},
		darkColors: {
			primary: 'oklch(0.743 0.181 19.301)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.743 0.181 19.301)'
		}
	},
	blue: {
		name: 'blue',
		get label() {
			return m.theme_blue();
		},
		active: false,
		colors: {
			primary: 'oklch(0.488 0.243 264.376)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.488 0.243 264.376)'
		},
		darkColors: {
			primary: 'oklch(0.588 0.243 264.376)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.588 0.243 264.376)'
		}
	},
	green: {
		name: 'green',
		get label() {
			return m.theme_green();
		},
		active: false,
		colors: {
			primary: 'oklch(0.54 0.194 142.495)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.54 0.194 142.495)'
		},
		darkColors: {
			primary: 'oklch(0.64 0.194 142.495)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.64 0.194 142.495)'
		}
	},
	purple: {
		name: 'purple',
		get label() {
			return m.theme_purple();
		},
		active: false,
		colors: {
			primary: 'oklch(0.589 0.25 292.514)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.589 0.25 292.514)'
		},
		darkColors: {
			primary: 'oklch(0.689 0.25 292.514)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.689 0.25 292.514)'
		}
	},
	orange: {
		name: 'orange',
		get label() {
			return m.theme_orange();
		},
		active: false,
		colors: {
			primary: 'oklch(0.662 0.218 46.415)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.662 0.218 46.415)'
		},
		darkColors: {
			primary: 'oklch(0.762 0.218 46.415)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.762 0.218 46.415)'
		}
	},
	yellow: {
		name: 'yellow',
		get label() {
			return m.theme_yellow();
		},
		active: false,
		colors: {
			primary: 'oklch(0.776 0.173 91.935)',
			primaryForeground: 'oklch(0.205 0 0)',
			ring: 'oklch(0.776 0.173 91.935)'
		},
		darkColors: {
			primary: 'oklch(0.876 0.173 91.935)',
			primaryForeground: 'oklch(0.145 0 0)',
			ring: 'oklch(0.876 0.173 91.935)'
		}
	},
	teal: {
		name: 'teal',
		get label() {
			return m.theme_teal();
		},
		active: false,
		colors: {
			primary: 'oklch(0.559 0.151 180.735)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.559 0.151 180.735)'
		},
		darkColors: {
			primary: 'oklch(0.659 0.151 180.735)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.659 0.151 180.735)'
		}
	},
	indigo: {
		name: 'indigo',
		get label() {
			return m.theme_indigo();
		},
		active: false,
		colors: {
			primary: 'oklch(0.482 0.198 272.314)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.482 0.198 272.314)'
		},
		darkColors: {
			primary: 'oklch(0.582 0.198 272.314)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.582 0.198 272.314)'
		}
	},
	pink: {
		name: 'pink',
		get label() {
			return m.theme_pink();
		},
		active: false,
		colors: {
			primary: 'oklch(0.671 0.221 349.761)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.671 0.221 349.761)'
		},
		darkColors: {
			primary: 'oklch(0.771 0.221 349.761)',
			primaryForeground: 'oklch(0.985 0 0)',
			ring: 'oklch(0.771 0.221 349.761)'
		}
	}
};

export const themesList = Object.values(themes);
