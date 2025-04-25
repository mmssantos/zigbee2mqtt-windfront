import type { Cluster } from "../../types.js";

export interface ClusterGroup {
    name: string;
    clusters: Set<Cluster>;
}

export function isClusterGroup(clusters: Set<Cluster> | ClusterGroup[]): clusters is ClusterGroup[] {
    return "name" in clusters && "clusters" in clusters;
}
