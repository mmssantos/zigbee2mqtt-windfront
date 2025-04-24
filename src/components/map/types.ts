import type { DeviceType } from "../../types.js";

export interface NodeRaw {
    ieeeAddr: string;
    friendlyName: string;
    type: DeviceType;
    networkAddress: number;
    manufacturerName: string | undefined | null;
    modelID: string | undefined | null;
    failed: string[];
    lastSeen: number | undefined | null;
    definition?: { model: string; vendor: string; supports: string; description: string } | null;
}

export enum ZigbeeRelationship {
    NeighborIsParent = 0x00,
    NeighborIsAChild = 0x01,
    NeighborIsASibling = 0x02,
    NoneOfTheAbove = 0x03,
    NeighborIsPreviousChild = 0x04,
}

export interface LinkRaw {
    source: { ieeeAddr: string; networkAddress: number };
    target: { ieeeAddr: string; networkAddress: number };
    linkquality: number;
    depth: number;
    routes: {
        destinationAddress: number;
        status: string;
        nextHop: number;
    }[];
    /** @deprecated use `source.ieeeAddr` */
    sourceIeeeAddr: string;
    /** @deprecated use `target.ieeeAddr` */
    targetIeeeAddr: string;
    /** @deprecated use `source.networkAddress` */
    sourceNwkAddr: number;
    /** @deprecated use `linkquality` */
    lqi: number;
    relationship: ZigbeeRelationship;
}

export interface GraphRaw {
    nodes: NodeRaw[];
    links: LinkRaw[];
}
