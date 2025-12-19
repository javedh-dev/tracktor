export type ThemeName =
	| 'slate'
	| 'stone'
	| 'red'
	| 'rose'
	| 'blue'
	| 'green'
	| 'purple'
	| 'orange'
	| 'yellow'
	| 'teal'
	| 'indigo'
	| 'pink';

export interface ThemeColors {
	background?: string;
	foreground?: string;
	card?: string;
	cardForeground?: string;
	popover?: string;
	popoverForeground?: string;
	muted?: string;
	mutedForeground?: string;
	accent?: string;
	accentForeground?: string;
	destructive?: string;
	border?: string;
	input?: string;
	ring?: string;
	primary?: string;
	primaryForeground?: string;
	secondary?: string;
	secondaryForeground?: string;
	[key: string]: string | undefined;
}

export interface ThemeConfig {
	name: ThemeName;
	label: string;
	active: boolean;
	colors?: ThemeColors;
	darkColors?: ThemeColors;
}

export interface ThemeContextValue {
	theme: ThemeName;
	themes: ThemeConfig[];
	setTheme: (theme: ThemeName) => void;
}
