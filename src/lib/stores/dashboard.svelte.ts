import { apiClient } from '$lib/helper/api.helper';
import type { DashboardSummary } from '$lib/domain/dashboard';

class DashboardStore {
  summary = $state<DashboardSummary | null>(null);
  loading = $state(false);
  error = $state<string | undefined>();

  async fetchSummary() {
    this.loading = true;
    this.error = undefined;
    try {
      const { data: res } = await apiClient.get<{ success: boolean; data: DashboardSummary }>(
        '/dashboard/summary'
      );
      if (res.success && res.data) {
        this.summary = res.data;
      }
    } catch (err) {
      this.error = 'Failed to load dashboard summary';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
}

export const dashboardStore = new DashboardStore();
