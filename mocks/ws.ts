import { WebSocketServer } from "ws";
import type { Message } from "../src/types.js";
import { BRIDGE_DEFINITION } from "./bridgeDefinitions.js";
import { BRIDGE_DEVICES } from "./bridgeDevices.js";
import { BRIDGE_EXTENSIONS } from "./bridgeExtensions.js";
import { BRIDGE_GROUPS } from "./bridgeGroups.js";
import { BRIDGE_INFO } from "./bridgeInfo.js";
import { BRIDGE_LOGGING, BRIDGE_LOGGING_EXECUTE_COMMAND, BRIDGE_LOGGING_READ_ATTR } from "./bridgeLogging.js";
import { BRIDGE_STATE } from "./bridgeState.js";
import { DEVICE_AVAILABILITY } from "./deviceAvailability.js";
import { DEVICE_STATES } from "./deviceState.js";
import { GENERATE_EXTERNAL_DEFINITION_RESPONSE } from "./generateExternalDefinitionResponse.js";
import { NETWORK_MAP_RESPONSE } from "./networkMapResponse.js";
import { TOUCHLINK_RESPONSE } from "./touchlinkResponse.js";

export function startServer() {
    const wss = new WebSocketServer({
        port: 8579,
    });

    wss.on("connection", (ws) => {
        ws.send(JSON.stringify(BRIDGE_STATE));
        ws.send(JSON.stringify(BRIDGE_INFO));
        ws.send(JSON.stringify(BRIDGE_DEVICES));
        ws.send(JSON.stringify(BRIDGE_GROUPS));
        ws.send(JSON.stringify(BRIDGE_DEFINITION));
        ws.send(JSON.stringify(BRIDGE_EXTENSIONS));

        for (const message of DEVICE_AVAILABILITY) {
            ws.send(JSON.stringify(message));
        }

        for (const message of DEVICE_STATES) {
            ws.send(JSON.stringify(message));
        }

        let i = 1;

        for (const message of BRIDGE_LOGGING) {
            setTimeout(() => {
                ws.send(JSON.stringify(message));
            }, i * 2000);

            i++;
        }

        ws.addEventListener("message", (message) => {
            // biome-ignore lint/suspicious/noExplicitAny: debug
            const msg: Message<any> = JSON.parse(message.data as string);

            switch (msg.topic) {
                case "bridge/request/networkmap": {
                    setTimeout(() => {
                        ws.send(JSON.stringify(NETWORK_MAP_RESPONSE));
                    }, 2500);
                    break;
                }
                case "bridge/request/touchlink/scan": {
                    setTimeout(() => {
                        ws.send(JSON.stringify(TOUCHLINK_RESPONSE));
                    }, 500);
                    break;
                }
                case "bridge/request/device/generate_external_definition": {
                    setTimeout(() => {
                        ws.send(JSON.stringify(GENERATE_EXTERNAL_DEFINITION_RESPONSE).replace("$ID", msg.payload.id));
                    }, 500);
                    break;
                }
                default: {
                    if (msg.topic.endsWith("/set")) {
                        if ("command" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_EXECUTE_COMMAND));
                            }, 500);
                        } else if ("read" in msg.payload) {
                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_LOGGING_READ_ATTR));
                            }, 500);
                        }
                    }
                    break;
                }
            }
        });
    });

    console.log("Started WebSocket server");
}
