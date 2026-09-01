import type { EntityScope } from "@/api/types";
import type { ShiftWindowOption } from "@/utils/shift";

export interface DashboardFilters {
  entityScope: EntityScope | null;
  assetLabel: string | null;
  dateStr: string;
  shiftWindow: ShiftWindowOption | null;
  showIndividualProduces: boolean;
}
