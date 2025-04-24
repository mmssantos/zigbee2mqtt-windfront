import { WebSocketServer } from "ws";
import { BRIDGE_DEFINITIONS } from "./bridgeDefinitions.js";
import { BRIDGE_DEVICES } from "./bridgeDevices.js";
import { BRIDGE_EXTENSIONS } from "./bridgeExtensions.js";
import { BRIDGE_GROUPS } from "./bridgeGroups.js";
import { BRIDGE_INFO } from "./bridgeInfo.js";
import { BRIDGE_LOGGING } from "./bridgeLogging.js";
import { BRIDGE_STATE } from "./bridgeState.js";
import { DEVICE_AVAILABILITY } from "./deviceAvailability.js";
import { DEVICE_STATES } from "./deviceState.js";
import { NETWORK_MAP_REQUEST } from "./networkMapRequest.js";
import { TOUCHLINK_REQUEST } from "./touchlinkRequest.js";

export function startServer() {
    const wss = new WebSocketServer({
        port: 8579,
    });

    wss.on("connection", (ws) => {
        ws.send(JSON.stringify(BRIDGE_STATE));
        ws.send(JSON.stringify(BRIDGE_INFO));
        ws.send(JSON.stringify(BRIDGE_DEVICES));
        ws.send(JSON.stringify(BRIDGE_GROUPS));
        ws.send(JSON.stringify(BRIDGE_DEFINITIONS));
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
            const msg = JSON.parse(message.data as string);

            switch (msg.topic) {
                case "bridge/request/networkmap":
                    setTimeout(() => {
                        ws.send(JSON.stringify(NETWORK_MAP_REQUEST));
                    }, 2500);
                    break;
                case "bridge/request/touchlink/scan":
                    setTimeout(() => {
                        ws.send(JSON.stringify(TOUCHLINK_REQUEST));
                    }, 500);
                    break;
                default:
                    break;
            }
        });
    });

    console.log("Started WebSocket server");
}
