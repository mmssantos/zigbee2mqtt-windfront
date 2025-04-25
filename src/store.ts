import { type PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import type { Zigbee2MQTTAPI } from "zigbee2mqtt/dist/types/api.js";
import type { GraphRaw } from "./components/map/types.js";
import type { BridgeDefinition, BridgeInfo, Device, DeviceState, Group, Message, TouchlinkDevice } from "./types.js";
import { formatDate } from "./utils.js";

export interface LogMessage {
    level: "error" | "info" | "warning" | "debug";
    message: string;
    timestamp: string;
}

export type Extension = {
    name: string;
    code: string;
};

export type Devices = Record<string, Device>;

// Zigbee2MQTTAPI['bridge/devices']
export type WithDevices = {
    devices: Devices; // TODO change to Device[]
};

// Zigbee2MQTTAPI['{friendlyName}'];
export type WithDeviceStates = {
    deviceStates: Record<string, DeviceState>;
};

// Zigbee2MQTTAPI['bridge/groups']
export type WithGroups = {
    groups: Group[];
};

// Zigbee2MQTTAPI['bridge/info']
export type WithBridgeInfo = {
    bridgeInfo: BridgeInfo;
};

export type WithBridgeState = {
    bridgeState: {
        state: "online" | "offline";
    };
};

// Zigbee2MQTTAPI["{friendlyName}/availability"]
export type AvailabilityState = {
    state: "online" | "offline";
};

// Zigbee2MQTTAPI['{friendlyName}/availability']
export type WithAvailability = {
    availability: Record<string, AvailabilityState>;
};

export type Base64String = string;

export interface GlobalState extends WithDevices, WithDeviceStates, WithGroups, WithBridgeInfo, WithBridgeState, WithAvailability {
    touchlinkDevices: TouchlinkDevice[];
    touchlinkScanInProgress: boolean;
    touchlinkIdentifyInProgress: boolean;
    touchlinkResetInProgress: boolean;
    networkGraph: GraphRaw;
    networkGraphIsLoading: boolean;
    bridgeDefinition: BridgeDefinition;
    logs: LogMessage[];
    logsLimit: number;
    extensions: Extension[];
    missingTranslations: Record<string, unknown>;
    preparingBackup: boolean;
    backup: Base64String;
    generatedExternalDefinitions: Record<string, string>;
}

export const AVAILABILITY_FEATURE_TOPIC_ENDING = "/availability";

const initialState: GlobalState = {
    devices: {},
    deviceStates: {},
    touchlinkDevices: [],
    touchlinkScanInProgress: false,
    touchlinkIdentifyInProgress: false,
    touchlinkResetInProgress: false,
    networkGraph: {
        links: [],
        nodes: [],
    },
    networkGraphIsLoading: false,
    groups: [],
    bridgeState: { state: "offline" },
    bridgeDefinition: {
        // @ts-expect-error unloaded
        clusters: {},
        custom_clusters: {},
    },
    bridgeInfo: {
        config_schema: {
            // @ts-expect-error unloaded
            properties: {},
            required: [],
        },
        config: {
            advanced: {
                elapsed: false,
                last_seen: "disable",
                log_level: "info",
                log_rotation: false,
                log_console_json: false,
                log_symlink_current: false,
                log_output: [],
                log_directory: "",
                log_file: "",
                log_namespaced_levels: {},
                log_syslog: {},
                log_debug_to_mqtt_frontend: false,
                log_debug_namespace_ignore: "",
                log_directories_to_keep: 0,
                pan_id: 0,
                ext_pan_id: [],
                channel: 0,
                cache_state: false,
                cache_state_persistent: false,
                cache_state_send_on_startup: false,
                network_key: [],
                timestamp_format: "",
                output: "json",
            },
            devices: {},
            device_options: {},
            frontend: {
                enabled: true,
                port: 8080,
                base_url: "/",
            },
            homeassistant: {
                enabled: false,
                discovery_topic: "",
                status_topic: "",
                experimental_event_entities: false,
                legacy_action_sensor: false,
            },
            availability: {
                enabled: false,
                active: {
                    timeout: 0,
                    max_jitter: 0,
                    backoff: false,
                    pause_on_backoff_gt: 0,
                },
                passive: {
                    timeout: 0,
                },
            },
            mqtt: {
                base_topic: "",
                include_device_information: false,
                force_disable_retain: false,
                server: "",
                maximum_packet_size: 0,
            },
            serial: {
                disable_led: false,
            },
            passlist: [],
            blocklist: [],
            map_options: {
                // @ts-expect-error not needed
                graphviz: {},
            },
            ota: {
                update_check_interval: 0,
                disable_automatic_update_check: false,
                zigbee_ota_override_index_location: undefined,
                image_block_response_delay: undefined,
                default_maximum_data_size: undefined,
            },
            groups: {},
        },
        permit_join: false,
        permit_join_end: undefined,
        zigbee_herdsman_converters: {
            version: "",
        },
        zigbee_herdsman: {
            version: "",
        },
        device_options: {},
        restart_required: false,
        version: "",
        coordinator: {
            meta: {},
            type: "",
            ieee_address: "",
        },
    },
    logs: [],
    logsLimit: 100,
    extensions: [],
    missingTranslations: {},
    generatedExternalDefinitions: {},
    availability: {},
    preparingBackup: false,
    backup: "",
};

export const storeSlice = createSlice({
    name: "store",
    initialState,
    reducers: {
        setExtensions: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/extensions"]>) => {
            state.extensions = action.payload;
        },
        setTouchlinkScan: (
            state,
            action: PayloadAction<{ inProgress: boolean; devices: Zigbee2MQTTAPI["bridge/response/touchlink/scan"]["found"] }>,
        ) => {
            state.touchlinkScanInProgress = action.payload.inProgress;
            state.touchlinkDevices = action.payload.devices;
        },
        setTouchlinkIdentifyInProgress: (state, action: PayloadAction<boolean>) => {
            state.touchlinkIdentifyInProgress = action.payload;
        },
        setTouchlinkResetInProgress: (state, action: PayloadAction<boolean>) => {
            state.touchlinkResetInProgress = action.payload;
        },
        clearLogs: (state) => {
            state.logs = [];
        },
        setLogsLimit: (state, action: PayloadAction<number>) => {
            state.logsLimit = action.payload;
            state.logs = state.logs.slice(-action.payload);
        },
        addLog: (state, action: PayloadAction<LogMessage>) => {
            if (state.logs.length > state.logsLimit) {
                state.logs.pop();
            }

            state.logs.push({ ...action.payload, timestamp: formatDate(new Date()) });
        },
        updateDeviceStateMessage: (state, action: PayloadAction<Message<Zigbee2MQTTAPI["{friendlyName}"]>>) => {
            state.deviceStates[action.payload.topic] = Object.assign(state.deviceStates[action.payload.topic] ?? {}, action.payload.payload);
        },
        updateAvailability: (state, action: PayloadAction<Message<Zigbee2MQTTAPI["{friendlyName}/availability"]>>) => {
            const friendlyName = action.payload.topic.split(AVAILABILITY_FEATURE_TOPIC_ENDING, 1)[0];
            state.availability[friendlyName] = action.payload.payload;
        },
        setBridgeInfo: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/info"]>) => {
            state.bridgeInfo = action.payload;
        },
        setBridgeState: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/state"]>) => {
            state.bridgeState = action.payload;
        },
        setBridgeDefinitions: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/definition"]>) => {
            state.bridgeDefinition = action.payload;
        },
        setDevices: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/devices"]>) => {
            state.devices = action.payload;
        },
        setGroups: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/groups"]>) => {
            state.groups = action.payload;
        },
        setNetworkGraph: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/response/networkmap"]["value"] | null>) => {
            state.networkGraphIsLoading = false;

            if (action.payload == null) {
                state.networkGraph = {
                    links: [],
                    nodes: [],
                };
            } else if (typeof action.payload !== "string") {
                state.networkGraph = action.payload;
            }
        },
        setNetworkGraphIsLoading: (state) => {
            state.networkGraphIsLoading = true;
            state.networkGraph = { nodes: [], links: [] };
        },
        setBackup: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/response/backup"]["zip"]>) => {
            state.preparingBackup = false;
            state.backup = action.payload;
        },
        setBackupPreparing: (state) => {
            state.preparingBackup = true;
        },
        addGeneratedExternalDefinition: (state, action: PayloadAction<Zigbee2MQTTAPI["bridge/response/device/generate_external_definition"]>) => {
            state.generatedExternalDefinitions[action.payload.id] = action.payload.source;
        },
    },
});

const store = configureStore<GlobalState>({
    reducer: storeSlice.reducer,
});

export const {
    setExtensions,
    setTouchlinkScan,
    setTouchlinkIdentifyInProgress,
    setTouchlinkResetInProgress,
    clearLogs,
    setLogsLimit,
    addLog,
    updateDeviceStateMessage,
    updateAvailability,
    setBridgeInfo,
    setBridgeState,
    setBridgeDefinitions,
    setDevices,
    setGroups,
    setNetworkGraph,
    setNetworkGraphIsLoading,
    setBackup,
    setBackupPreparing,
    addGeneratedExternalDefinition,
} = storeSlice.actions;

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;
