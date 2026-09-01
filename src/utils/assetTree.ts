import type { AssetNode } from "@/api/types";

export interface FlatAssetOption {
  id: string;
  assetLevelId: number;
  label: string;
  depth: number;
}

export function flattenAssetTree(nodes: AssetNode[]): FlatAssetOption[] {
  const result: FlatAssetOption[] = [];

  function visit(node: AssetNode, depth: number) {
    result.push({
      id: node.id,
      assetLevelId: node.assetlevel_id,
      label: node.name,
      depth,
    });
    node.children.forEach((child) => visit(child, depth + 1));
  }

  nodes.forEach((node) => visit(node, 0));
  return result;
}

/** Defaults the filter bar to the most specific (deepest) node instead of the top-level customer. */
export function pickDeepestAsset(options: FlatAssetOption[]): FlatAssetOption | null {
  if (options.length === 0) return null;
  return options.reduce((deepest, option) => (option.depth > deepest.depth ? option : deepest));
}
