import { useEffect } from "react";
import type { Zigbee2MQTTAPI, Zigbee2MQTTResponse } from "zigbee2mqtt";
import { WebSocketApiRouterContext } from "./WebSocketApiRouterContext.js";
import { resolvePendingRequests, useApiWebSocket } from "./hooks/useApiWebSocket.js";
import { useAppDispatch } from "./hooks/useApp.js";
import * as store from "./store.js";
import type { Message, RecursiveMutable, ResponseMessage } from "./types.js";

const processDeviceStateMessage = (message: Message, dispatch: ReturnType<typeof useAppDispatch>): void => {
    dispatch(store.updateDeviceStateMessage(message));
};

const processDeviceAvailabilityMessage = (message: Message, dispatch: ReturnType<typeof useAppDispatch>): void => {
    dispatch(store.updateAvailability(message));
};

const processBridgeMessage = (data: Message, dispatch: ReturnType<typeof useAppDispatch>): void => {
    switch (data.topic) {
        case "bridge/info": {
            dispatch(store.setBridgeInfo(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/state": {
            dispatch(store.setBridgeState(data.payload as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/definitions": {
            dispatch(store.setBridgeDefinitions(data.payload as RecursiveMutable<Zigbee2MQTTAPI[typeof data.topic]>));
            break;
        }
        case "bridge/devices": {
            dispatch(store.setDevices(data.payload as unknown as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/groups": {
            dispatch(store.setGroups(data.payload as unknown as Zigbee2MQTTAPI[typeof data.topic]));
            break;
        }
        case "bridge/converters": {
            dispatch(store.setConverters(data.payload as Zigbee2MQTTAPI[typeof data.topic])); // TODO: missing in Z2M
            break;
        }
        case "bridge/extensions": {
            dispatch(store.setExtensions(data.payload as Zigbee2MQTTAPI[typeof data.topic])); // TODO: missing in Z2M
            break;
        }
        case "bridge/logging": {
            const log = data.payload as Zigbee2MQTTAPI[typeof data.topic];

            dispatch(store.addLog(log));

            break;
        }
        case "bridge/response/networkmap": {
            const response = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            dispatch(store.setNetworkGraph(response.status === "ok" ? response.data.value : null));

            break;
        }
        case "bridge/response/touchlink/scan": {
            const { status, data: payloadData } = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            dispatch(
                store.setTouchlinkScan(status === "ok" ? { inProgress: false, devices: payloadData.found } : { inProgress: false, devices: [] }),
            );

            break;
        }
        case "bridge/response/touchlink/identify": {
            dispatch(store.setTouchlinkIdentifyInProgress(false));
            break;
        }
        case "bridge/response/touchlink/factory_reset": {
            dispatch(store.setTouchlinkResetInProgress(false));
            break;
        }
        case "bridge/response/backup": {
            const backupData = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            dispatch(store.setBackup(backupData.data.zip));
            break;
        }
        case "bridge/response/device/generate_external_definition": {
            const extDef = data.payload as Zigbee2MQTTResponse<typeof data.topic>;

            if (extDef.status === "ok") {
                dispatch(store.addGeneratedExternalDefinition(extDef.data));
            }
            break;
        }
    }

    if (data.topic.startsWith("bridge/response/")) {
        // biome-ignore lint/suspicious/noExplicitAny: tmp
        resolvePendingRequests((data as unknown as ResponseMessage<any>).payload);
    }
};

export function WebSocketApiRouter({ children }) {
    const webSocket = useApiWebSocket();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (webSocket.lastJsonMessage != null) {
            try {
                if (webSocket.lastJsonMessage.topic.endsWith(store.AVAILABILITY_FEATURE_TOPIC_ENDING)) {
                    processDeviceAvailabilityMessage(webSocket.lastJsonMessage, dispatch);
                } else if (webSocket.lastJsonMessage.topic.startsWith("bridge/")) {
                    processBridgeMessage(webSocket.lastJsonMessage, dispatch);
                } else {
                    processDeviceStateMessage(webSocket.lastJsonMessage, dispatch);
                }
            } catch (error) {
                dispatch(store.addLog({ level: "error", message: `browser: ${error.message}`, namespace: "browser" }));
                console.error(error, webSocket.lastJsonMessage);
            }
        }
    }, [webSocket.lastJsonMessage, dispatch]);

    return <WebSocketApiRouterContext.Provider value={webSocket}>{children}</WebSocketApiRouterContext.Provider>;
}
