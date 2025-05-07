import { WebSocketServer } from "ws";
import type { Message, ResponseMessage } from "../src/types.js";
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
import { PERMIT_JOIN_RESPONSE } from "./permitJoinResponse.js";
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

            if (msg.topic === "bridge/request/permit_join" && msg.payload.time > 0 && msg.payload.device === "0x0017880103d55d65") {
                setTimeout(() => {
                    ws.send(
                        JSON.stringify({
                            payload: {
                                status: "error",
                                error: "Failed permit join",
                                data: {},
                                transaction: msg.payload.transaction,
                            },
                            topic: msg.topic.replace("bridge/request/", "bridge/response/"),
                        } satisfies ResponseMessage<"bridge/response/permit_join">),
                    );
                }, 25);

                return;
            }

            const sendResponseOK = () => {
                ws.send(
                    JSON.stringify({
                        payload: {
                            status: "ok",
                            data: {},
                            transaction: msg.payload.transaction,
                        },
                        topic: msg.topic.replace("bridge/request/", "bridge/response/"),
                        // biome-ignore lint/suspicious/noExplicitAny: generic
                    } satisfies ResponseMessage<any>),
                );
            };

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
                case "bridge/request/permit_join": {
                    setTimeout(() => {
                        if (msg.payload.time > 0) {
                            ws.send(JSON.stringify(PERMIT_JOIN_RESPONSE));

                            const permitBridgeInfo = structuredClone(BRIDGE_INFO);
                            permitBridgeInfo.payload.permit_join = true;
                            permitBridgeInfo.payload.permit_join_end = Date.now() + msg.payload.time * 1000;

                            ws.send(JSON.stringify(permitBridgeInfo));

                            setTimeout(() => {
                                ws.send(JSON.stringify(BRIDGE_INFO));
                            }, msg.payload.time * 1000);
                        } else {
                            sendResponseOK();
                            ws.send(JSON.stringify(BRIDGE_INFO));
                        }
                    }, 50);
                    break;
                }
                case "bridge/request/device/ota_update/update": {
                    sendResponseOK();

                    const deviceState = DEVICE_STATES.find((state) => state.topic === msg.payload.id);

                    if (deviceState) {
                        const updatedDeviceState = structuredClone(deviceState);
                        updatedDeviceState.payload.update = {
                            progress: 0,
                            remaining: 600,
                            state: "updating",
                            installed_version: 1,
                            latest_version: 2,
                        };

                        const interval = setInterval(() => {
                            ws.send(JSON.stringify(updatedDeviceState));

                            updatedDeviceState.payload.update!.progress! += 1;
                            updatedDeviceState.payload.update!.remaining! -= 1;
                        }, 1000);

                        setTimeout(() => {
                            clearInterval(interval);
                        }, 25000);
                    }

                    break;
                }
                case "bridge/request/device/ota_update/schedule": {
                    sendResponseOK();

                    const deviceState = DEVICE_STATES.find((state) => state.topic === msg.payload.id);

                    if (deviceState) {
                        const updatedDeviceState = structuredClone(deviceState);

                        if (!updatedDeviceState.payload.update) {
                            updatedDeviceState.payload.update = { state: "scheduled", installed_version: null, latest_version: null };
                        } else {
                            updatedDeviceState.payload.update.state = "scheduled";
                        }

                        ws.send(JSON.stringify(updatedDeviceState));
                    }

                    break;
                }
                case "bridge/request/device/ota_update/unschedule": {
                    sendResponseOK();

                    const deviceState = DEVICE_STATES.find((state) => state.topic === msg.payload.id);

                    if (deviceState) {
                        const updatedDeviceState = structuredClone(deviceState);

                        if (!updatedDeviceState.payload.update) {
                            updatedDeviceState.payload.update = { state: "idle", installed_version: null, latest_version: null };
                        } else if (deviceState.payload.update?.state === "scheduled") {
                            updatedDeviceState.payload.update.state = "idle"; // simpler
                        }

                        ws.send(JSON.stringify(updatedDeviceState));
                    }

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
                    } else if (msg.topic.startsWith("bridge/request/")) {
                        sendResponseOK();
                    }

                    break;
                }
            }
        });
    });

    console.log("Started WebSocket server");
}
