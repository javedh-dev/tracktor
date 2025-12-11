import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { simulateNetworkDelay } from '../dev.helper';

describe('Dev Helper', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	describe('simulateNetworkDelay', () => {
		it('should resolve after specified delay', async () => {
			const delay = 1000;
			const promise = simulateNetworkDelay(delay);

			// Initially, promise should not be resolved
			let resolved = false;
			promise.then(() => {
				resolved = true;
			});

			expect(resolved).toBe(false);

			// Fast-forward time by the delay amount
			vi.advanceTimersByTime(delay);

			// Wait for promise to resolve
			await promise;
			expect(resolved).toBe(true);
		});

		it('should work with zero delay', async () => {
			const promise = simulateNetworkDelay(0);

			vi.advanceTimersByTime(0);
			await promise;

			// Should resolve immediately
			await expect(promise).resolves.toBeUndefined();
		});

		it('should work with different delay values', async () => {
			const delays = [100, 500, 2000, 5000];

			for (const delay of delays) {
				const startTime = Date.now();
				const promise = simulateNetworkDelay(delay);

				vi.advanceTimersByTime(delay);
				await promise;

				// Promise should be resolved after advancing time
				await expect(promise).resolves.toBeUndefined();
			}
		});

		it('should not resolve before the specified time', async () => {
			const delay = 2000;
			const promise = simulateNetworkDelay(delay);

			let resolved = false;
			promise.then(() => {
				resolved = true;
			});

			// Advance time by less than the delay
			vi.advanceTimersByTime(delay - 100);

			// Should not be resolved yet
			expect(resolved).toBe(false);

			// Advance the remaining time
			vi.advanceTimersByTime(100);
			await promise;

			expect(resolved).toBe(true);
		});

		it('should handle multiple concurrent delays', async () => {
			const delay1 = 1000;
			const delay2 = 2000;
			const delay3 = 500;

			const promise1 = simulateNetworkDelay(delay1);
			const promise2 = simulateNetworkDelay(delay2);
			const promise3 = simulateNetworkDelay(delay3);

			let resolved1 = false;
			let resolved2 = false;
			let resolved3 = false;

			promise1.then(() => {
				resolved1 = true;
			});
			promise2.then(() => {
				resolved2 = true;
			});
			promise3.then(() => {
				resolved3 = true;
			});

			// After 500ms, only promise3 should resolve
			vi.advanceTimersByTime(500);
			await Promise.resolve(); // Allow microtasks to run
			expect(resolved3).toBe(true);
			expect(resolved1).toBe(false);
			expect(resolved2).toBe(false);

			// After 1000ms total, promise1 should also resolve
			vi.advanceTimersByTime(500);
			await Promise.resolve();
			expect(resolved1).toBe(true);
			expect(resolved2).toBe(false);

			// After 2000ms total, promise2 should resolve
			vi.advanceTimersByTime(1000);
			await Promise.resolve();
			expect(resolved2).toBe(true);
		});

		it('should work in real-world simulation scenarios', async () => {
			// Simulate API call with network delay
			const mockApiCall = async (data: any) => {
				await simulateNetworkDelay(1000); // Simulate 1s network delay
				return { success: true, data };
			};

			const testData = { userId: 123, action: 'update' };
			const promise = mockApiCall(testData);

			let result: any = null;
			promise.then((res) => {
				result = res;
			});

			// Should not have result yet
			expect(result).toBeNull();

			// Fast-forward time
			vi.advanceTimersByTime(1000);
			await promise;

			expect(result).toEqual({ success: true, data: testData });
		});

		it('should work with Promise.all', async () => {
			const delays = [100, 200, 300];
			const promises = delays.map((delay) => simulateNetworkDelay(delay));

			const allPromise = Promise.all(promises);
			let resolved = false;
			allPromise.then(() => {
				resolved = true;
			});

			// Should not resolve until all delays are complete
			vi.advanceTimersByTime(200);
			await Promise.resolve();
			expect(resolved).toBe(false);

			// Should resolve after the longest delay
			vi.advanceTimersByTime(100);
			await allPromise;
			expect(resolved).toBe(true);
		});

		it('should work with Promise.race', async () => {
			const delays = [1000, 500, 2000];
			const promises = delays.map((delay) => simulateNetworkDelay(delay));

			const racePromise = Promise.race(promises);
			let resolved = false;
			racePromise.then(() => {
				resolved = true;
			});

			// Should not resolve yet
			vi.advanceTimersByTime(400);
			await Promise.resolve();
			expect(resolved).toBe(false);

			// Should resolve after the shortest delay (500ms)
			vi.advanceTimersByTime(100);
			await racePromise;
			expect(resolved).toBe(true);
		});

		it('should handle edge cases', async () => {
			// Test with very large delay
			const largeDelay = 1000000; // 1000 seconds
			const promise = simulateNetworkDelay(largeDelay);

			let resolved = false;
			promise.then(() => {
				resolved = true;
			});

			vi.advanceTimersByTime(largeDelay - 1);
			await Promise.resolve();
			expect(resolved).toBe(false);

			vi.advanceTimersByTime(1);
			await promise;
			expect(resolved).toBe(true);
		});

		it('should be useful for testing loading states', async () => {
			let isLoading = false;
			let data: any = null;

			const fetchData = async () => {
				isLoading = true;
				await simulateNetworkDelay(1000);
				data = { id: 1, name: 'Test Data' };
				isLoading = false;
				return data;
			};

			const promise = fetchData();

			// Initially loading should be true
			expect(isLoading).toBe(true);
			expect(data).toBeNull();

			// After delay, loading should be false and data should be set
			vi.advanceTimersByTime(1000);
			await promise;

			expect(isLoading).toBe(false);
			expect(data).toEqual({ id: 1, name: 'Test Data' });
		});

		it('should be useful for testing timeout scenarios', async () => {
			const TIMEOUT = 5000;
			const DELAY = 6000; // Longer than timeout

			const timeoutPromise = new Promise((_, reject) => {
				setTimeout(() => reject(new Error('Timeout')), TIMEOUT);
			});

			const delayPromise = simulateNetworkDelay(DELAY);

			const racePromise = Promise.race([delayPromise, timeoutPromise]);

			// Advance time to trigger timeout
			vi.advanceTimersByTime(TIMEOUT);

			await expect(racePromise).rejects.toThrow('Timeout');
		});
	});
});
