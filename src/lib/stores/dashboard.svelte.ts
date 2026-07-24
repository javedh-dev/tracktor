import { apiClient } from '$lib/helper/api.helper';

interface DashboardSummary {
  totalVehicles: number;
  totalFuelUsed: number;
  totalDistance: number;
  totalExpenses: number;
  expenseBreakdown: { fuel: number; maintenance: number; insurance: number };
  puccStatus: { valid: number; expiringSoon: number; expired: number; notAvailable: number };
  vehicleHealth: { good: number; attention: number; needsAction: number };
  upcomingReminders: Array<{
    id: string;
    vehicleId: string;
    vehicleName: string;
    vehiclePlate: string | null;
    type: string;
    note: string | null;
    dueDate: string;
    daysUntilDue: number;
  }>;
}

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
