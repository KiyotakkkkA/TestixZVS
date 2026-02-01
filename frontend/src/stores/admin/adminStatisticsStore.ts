import { makeAutoObservable } from "mobx";

import type { AdminStatisticsFilters } from "../../types/admin/AdminStatistics";

const isShallowEqual = (a: Record<string, any>, b: Record<string, any>) =>
    Object.keys(a).every((key) => a[key] === b[key]);

export class AdminStatisticsStore {
    statisticsFilters: AdminStatisticsFilters = {
        date_from: "",
        date_to: "",
        min_percentage: "",
    };

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    get statisticsAppliedFilters(): AdminStatisticsFilters {
        return {
            date_from: this.statisticsFilters.date_from || undefined,
            date_to: this.statisticsFilters.date_to || undefined,
            min_percentage:
                this.statisticsFilters.min_percentage === ""
                    ? undefined
                    : this.statisticsFilters.min_percentage,
        };
    }

    updateStatisticsFilters(next: Partial<AdminStatisticsFilters>): void {
        const updated = { ...this.statisticsFilters, ...next };
        if (
            isShallowEqual(
                updated as Record<string, any>,
                this.statisticsFilters as Record<string, any>,
            )
        )
            return;
        this.statisticsFilters = updated;
    }
}

export const adminStatisticsStore = new AdminStatisticsStore();
