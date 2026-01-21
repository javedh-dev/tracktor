const config = {
	content: ['./src/**/*.{html,js,svelte,ts,css}'],
	theme: {
		extend: {}
	},
	darkMode: 'class',
	plugins: [],
	future: {
		respectDefaultRingColorOpacity: true
	},
	// Enable RTL support via direction selector
	corePlugins: {
		preflight: true
	}
};

export default config;
