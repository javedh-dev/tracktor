const simulateNetworkDelay = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

export { simulateNetworkDelay };
