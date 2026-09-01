import { httpClient } from "./httpClient";
import type { AssetNode } from "./types";

export function fetchAssetTree(): Promise<AssetNode[]> {
  return httpClient.get<AssetNode[]>("/core/assets/tree").then((res) => res.data);
}
