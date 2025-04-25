import { WithBridgeState } from '../src/store.js';
import type { Message } from "../src/types.js";

export const BRIDGE_STATE: Message<WithBridgeState['bridgeState']> = {
    payload: {
        state: "online",
    },
    topic: "bridge/state",
};
