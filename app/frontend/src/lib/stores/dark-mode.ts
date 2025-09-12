import { writable } from 'svelte/store';

const createDarkModeStore = () => {
	const { subscribe, set } = writable<boolean>(false);

	function loadDarkModePreference() {
		if (typeof window !== 'undefined') {
			const darkMode = localStorage.getItem('darkMode');
			if (darkMode !== null) {
				set(darkMode === 'true');
			} else {
				set(false); // Default to light mode if no preference is set
			}
		}
	}

	loadDarkModePreference();

	return {
		subscribe,
		set
	};
};

export const darkModeStore = createDarkModeStore();
