import type { BridgeState, Message } from "../src/types.js";

export const BRIDGE_STATE: Message<BridgeState> = {
    payload: "online",
    topic: "bridge/state",
};
