import type { Zigbee2MQTTAPI, Zigbee2MQTTNetworkMap } from "zigbee2mqtt";

export type MapType = Zigbee2MQTTAPI["bridge/response/networkmap"]["type"];

export type DisplayType = "data" | "map";

export const enum ZigbeeRelationship {
    NeighborIsParent = 0x00,
    NeighborIsAChild = 0x01,
    NeighborIsASibling = 0x02,
    NoneOfTheAbove = 0x03,
    NeighborIsPreviousChild = 0x04,
}

export const ZIGBEE_RELATIONSHIP_TMAP = {
    [ZigbeeRelationship.NeighborIsParent]: "parents",
    [ZigbeeRelationship.NeighborIsAChild]: "children",
    [ZigbeeRelationship.NeighborIsASibling]: "siblings",
    [ZigbeeRelationship.NoneOfTheAbove]: "zigbee:none",
    // Z2M is currently skipping > 3, so this is never present
    [ZigbeeRelationship.NeighborIsPreviousChild]: "previous_children",
};

export type RawMapNode = Zigbee2MQTTNetworkMap["nodes"][number];
export type RawMapEdge = Zigbee2MQTTNetworkMap["links"][number];

/** T = top, B = bottom, L = left, and R = right */
export type DagreDirection = "TB" | "LR" | "BT" | "RL";
