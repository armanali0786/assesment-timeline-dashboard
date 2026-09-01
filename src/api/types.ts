export interface ApiEnvelope<T> {
  trace_id: string;
  status_code: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface CurrentUser {
  id: string;
  username: string;
  name: string;
  email: string;
  customer_id?: string;
  customer_name?: string;
  roles: string[];
  status?: string;
}

export interface AssetNode {
  id: string;
  name: string;
  codename: string | null;
  assetlevel_id: number;
  hierarchy: string | null;
  children: AssetNode[];
}

export interface Shift {
  id: string;
  code: string;
  name: string;
  shift_timings: string[];
  is_active: boolean;
}

export interface EntityScope {
  type: "asset";
  asset: { asset_id: string; asset_level_id: number };
}

export interface TimeRange {
  from_ts: string;
  to_ts: string;
}

export interface MachineIntervalsRequest {
  entity_scope: EntityScope;
  time_range: TimeRange;
  produce_counts: boolean;
  exact_produces: boolean;
  group_produce_counts_by_part_model: boolean;
}

export type RuntimeType = "planned" | "unknown unplanned production" | (string & {});

export interface RuntimeSegment {
  start_at: string;
  end_at: string;
  type: RuntimeType;
  runtime_name: string | null;
}

export interface DowntimeSegment {
  start_at: string;
  end_at: string;
  downtime_name: string | null;
  type: string;
}

export interface StoppageSegment {
  start_at: string;
  end_at: string;
  type: string;
  stoppage_name?: string | null;
}

export interface ProduceCount {
  bucket_start: string;
  part_model_id: string;
  ok_count: number;
  ng_count: number;
}

export type ProduceResult = "PASS" | "FAIL";

export interface ProduceItem {
  produce_id: string;
  first_seen_ts: string;
  result: ProduceResult;
  produce_type: string;
  part_model_id: string;
}

export interface ProduceBucket {
  bucket_start: string;
  part_model_id: string;
  produces: ProduceItem[];
}

export interface MachineIntervalsResponse {
  machine_ids: number[];
  runtimes: RuntimeSegment[];
  downtimes: DowntimeSegment[];
  stoppages: StoppageSegment[];
  produce_counts: ProduceCount[];
  produces?: ProduceBucket[] | null;
}

export interface CycleTimeMetricsRequest {
  entity_scope: EntityScope;
  metrics: string[];
  time_range: TimeRange;
  distribution: "hourly";
}

export interface CycleTimeBucket {
  bucket_start: string;
  ideal_cycle_time_seconds: number | null;
  actual_cycle_time_seconds: number | null;
}
