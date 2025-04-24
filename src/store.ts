import { type PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import type { GraphRaw } from "./components/map/types.js";
import type {
    BridgeDefinitions,
    BridgeInfo,
    BridgeState,
    Device,
    DeviceState,
    FriendlyName,
    Group,
    IEEEEAddress,
    Message,
    TouchLinkDevice,
} from "./types.js";
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

export type Devices = Record<IEEEEAddress, Device>;

// Zigbee2MQTTAPI['bridge/devices']
export type WithDevices = {
    devices: Devices;
};

// Zigbee2MQTTAPI['{friendlyName}'];
export type WithDeviceStates = {
    deviceStates: Record<FriendlyName, DeviceState>;
};

// Zigbee2MQTTAPI['bridge/groups']
export type WithGroups = {
    groups: Group[];
};

// Zigbee2MQTTAPI['bridge/info']
export type WithBridgeInfo = {
    bridgeInfo: BridgeInfo;
};

export type OnlineOrOffline = "online" | "offline";

export type AvailabilityState =
    | OnlineOrOffline
    | {
          state: OnlineOrOffline;
      };

// Zigbee2MQTTAPI['{friendlyName}/availability']
export type WithAvailability = {
    availability: Record<FriendlyName, AvailabilityState>;
};

export type Base64String = string;

export interface GlobalState extends WithDevices, WithDeviceStates, WithGroups, WithBridgeInfo, WithAvailability {
    touchlinkDevices: TouchLinkDevice[];
    touchlinkScanInProgress: boolean;
    touchlinkIdentifyInProgress: boolean;
    touchlinkResetInProgress: boolean;
    networkGraph: GraphRaw;
    networkGraphIsLoading: boolean;
    bridgeState: BridgeState;
    bridgeDefinitions: BridgeDefinitions;
    logs: LogMessage[];
    logsLimit: number;
    extensions: Extension[];
    editingExtension?: string;
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
    bridgeState: "online",
    bridgeDefinitions: {
        clusters: {},
        custom_clusters: {},
    },
    bridgeInfo: {
        config_schema: {
            properties: {},
            required: [],
        },
        config: {
            advanced: {
                elapsed: false,
                last_seen: "disable",
                log_level: "info",
            },
            devices: {},
            device_options: {},
            frontend: {},
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
    editingExtension: undefined,
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
        setExtensions: (state, action: PayloadAction<GlobalState["extensions"]>) => {
            state.extensions = action.payload;
        },
        setEditingExtension: (state, action: PayloadAction<string | undefined>) => {
            state.editingExtension = action.payload;
        },
        setTouchlinkScan: (state, action: PayloadAction<{ inProgress: boolean; devices: TouchLinkDevice[] }>) => {
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
        updateDeviceStateMessage: (state, action: PayloadAction<Message>) => {
            state.deviceStates[action.payload.topic] = Object.assign(state.deviceStates[action.payload.topic] ?? {}, action.payload.payload);
        },
        updateAvailability: (state, action: PayloadAction<Message>) => {
            const friendlyName = action.payload.topic.split(AVAILABILITY_FEATURE_TOPIC_ENDING, 1)[0];
            state.availability[friendlyName] = action.payload.payload as OnlineOrOffline;
        },
        setBridgeInfo: (state, action: PayloadAction<GlobalState["bridgeInfo"]>) => {
            state.bridgeInfo = action.payload;
        },
        setBridgeState: (state, action: PayloadAction<GlobalState["bridgeState"]>) => {
            state.bridgeState = action.payload;
        },
        setBridgeDefinitions: (state, action: PayloadAction<GlobalState["bridgeDefinitions"]>) => {
            state.bridgeDefinitions = action.payload;
        },
        setDevices: (state, action: PayloadAction<GlobalState["devices"]>) => {
            state.devices = action.payload;
        },
        setGroups: (state, action: PayloadAction<GlobalState["groups"]>) => {
            state.groups = action.payload;
        },
        setNetworkGraph: (state, action: PayloadAction<GlobalState["networkGraph"] | undefined>) => {
            state.networkGraphIsLoading = false;

            if (action.payload) {
                state.networkGraph = action.payload;
            }
        },
        setNetworkGraphIsLoading: (state) => {
            state.networkGraphIsLoading = true;
            state.networkGraph = { nodes: [], links: [] };
        },
        setBackup: (state, action: PayloadAction<GlobalState["backup"]>) => {
            state.preparingBackup = false;
            state.backup = action.payload;
        },
        setBackupPreparing: (state) => {
            state.preparingBackup = true;
        },
        addGeneratedExternalDefinition: (state, action: PayloadAction<[id: string, source: string]>) => {
            state.generatedExternalDefinitions[action.payload[0]] = action.payload[1];
        },
    },
});

const store = configureStore<GlobalState>({
    reducer: storeSlice.reducer,
});

export const {
    setExtensions,
    setEditingExtension,
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
