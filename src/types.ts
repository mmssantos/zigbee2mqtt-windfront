import type {
    Zigbee2MQTTAPI,
    Zigbee2MQTTDevice,
    Zigbee2MQTTFeatures,
    Zigbee2MQTTGroup,
    Zigbee2MQTTRequest,
    Zigbee2MQTTRequestEndpoints,
    Zigbee2MQTTResponse,
    Zigbee2MQTTResponseEndpoints,
    Zigbee2MQTTScene,
} from "zigbee2mqtt";

export type RecursiveMutable<T> = { -readonly [K in keyof T]: RecursiveMutable<T[K]> };
// biome-ignore lint/complexity/noBannedTypes: generic type
export type OmitFunctions<T> = { [K in keyof T as T[K] extends Function ? never : K]: T[K] };

// TODO remove
export type Cluster = string | number;
export type Endpoint = string | number;

export type DeviceType = "Coordinator" | "Router" | "EndDevice" | "Unknown" | "GreenPower";

export type SendMessageEndpoints =
    | Zigbee2MQTTRequestEndpoints
    | "{friendlyNameOrId}/set"
    | "{friendlyNameOrId}/set/{attribute}"
    | "{friendlyNameOrId}/{endpoint}/set"
    | "{friendlyNameOrId}/{endpoint}/set/{attribute}"
    | "{friendlyNameOrId}/get"
    | "{friendlyNameOrId}/get/{attribute}"
    | "{friendlyNameOrId}/{endpoint}/get"
    | "{friendlyNameOrId}/{endpoint}/get/{attribute}";

export type DeviceState = Zigbee2MQTTAPI["{friendlyName}"];

export type PowerSource =
    | "Unknown"
    | "Mains (single phase)"
    | "Mains (3 phase)"
    | "Battery"
    | "DC Source"
    | "Emergency mains constantly powered"
    | "Emergency mains and transfer switch";

export type BridgeInfo = Zigbee2MQTTAPI["bridge/info"];

export type EntityType = "device" | "group";

export type Device = Zigbee2MQTTDevice;

export type Group = Zigbee2MQTTGroup;

export type Scene = Zigbee2MQTTScene;

export type TouchlinkDevice = Zigbee2MQTTAPI["bridge/response/touchlink/scan"]["found"][number];

export type LogMessage = Zigbee2MQTTAPI["bridge/logging"] & { timestamp: string };

export type AvailabilityState = Zigbee2MQTTAPI["{friendlyName}/availability"];

export type LastSeenType = "disable" | "ISO_8601" | "ISO_8601_local" | "epoch";

export interface Message<T = string | Record<string, unknown> | Record<string, unknown>[] | string[]> {
    topic: string;
    payload: T;
}

export interface RequestMessage<T extends Zigbee2MQTTRequestEndpoints> {
    topic: string;
    payload: Zigbee2MQTTRequest<T>;
}

export interface ResponseMessage<T extends Zigbee2MQTTResponseEndpoints> extends Message {
    payload: Zigbee2MQTTResponse<T>;
}

export enum InterviewState {
    Pending = "PENDING",
    InProgress = "IN_PROGRESS",
    Successful = "SUCCESSFUL",
    Failed = "FAILED",
}

//-- ZHC

export type GenericFeatureType = "binary" | "list" | "numeric" | "enum" | "text";
export type CompositeFeatureType = "switch" | "lock" | "composite" | "light" | "cover" | "fan" | "climate";

export enum FeatureAccessMode {
    /**
     * Bit 0: The property can be found in the published state of this device
     */
    STATE = 0b001,
    /**
     * Bit 1: The property can be set with a /set command
     */
    SET = 0b010,
    /**
     * Bit 2: The property can be retrieved with a /get command
     */
    GET = 0b100,
    /**
     * Bitwise inclusive OR of STATE and SET : 0b001 | 0b010
     */
    STATE_SET = 0b011,
    /**
     * Bitwise inclusive OR of STATE and GET : 0b001 | 0b100
     */
    STATE_GET = 0b101,
    /**
     * Bitwise inclusive OR of STATE and GET and SET : 0b001 | 0b100 | 0b010
     */
    ALL = 0b111,
}

export type GenericFeature =
    | OmitFunctions<Zigbee2MQTTFeatures["binary"]>
    | OmitFunctions<Zigbee2MQTTFeatures["list"]>
    | OmitFunctions<Zigbee2MQTTFeatures["numeric"]>
    | OmitFunctions<Zigbee2MQTTFeatures["enum"]>
    | OmitFunctions<Zigbee2MQTTFeatures["text"]>;

export type CompositeFeature =
    | OmitFunctions<Zigbee2MQTTFeatures["switch"]>
    | OmitFunctions<Zigbee2MQTTFeatures["lock"]>
    | OmitFunctions<Zigbee2MQTTFeatures["composite"]>
    | OmitFunctions<Zigbee2MQTTFeatures["light"]>
    | OmitFunctions<Zigbee2MQTTFeatures["cover"]>
    | OmitFunctions<Zigbee2MQTTFeatures["fan"]>
    | OmitFunctions<Zigbee2MQTTFeatures["climate"]>;

export type GenericOrCompositeFeature = OmitFunctions<GenericFeature> | OmitFunctions<CompositeFeature>;

export type BinaryFeature = OmitFunctions<Zigbee2MQTTFeatures["binary"]>;

export type ListFeature = OmitFunctions<Zigbee2MQTTFeatures["list"]>;

export type NumericFeature = OmitFunctions<Zigbee2MQTTFeatures["numeric"]>;

export type TextFeature = OmitFunctions<Zigbee2MQTTFeatures["text"]>;

export type EnumFeature = OmitFunctions<Zigbee2MQTTFeatures["enum"]>;

export type LightFeature = OmitFunctions<Zigbee2MQTTFeatures["light"]>;

export type SwitchFeature = OmitFunctions<Zigbee2MQTTFeatures["switch"]>;

export type CoverFeature = OmitFunctions<Zigbee2MQTTFeatures["cover"]>;

export type LockFeature = OmitFunctions<Zigbee2MQTTFeatures["lock"]>;

export type FanFeature = OmitFunctions<Zigbee2MQTTFeatures["fan"]>;

export type ClimateFeature = OmitFunctions<Zigbee2MQTTFeatures["climate"]>;

export type GradientFeature = OmitFunctions<Zigbee2MQTTFeatures["list"]> & {
    name: "gradient";
    item_type: "text";
    length_min: number;
    length_max: number;
};

export type ColorFeature = OmitFunctions<Zigbee2MQTTFeatures["composite"]> & {
    name: "color_xy" | "color_hs";
    features: OmitFunctions<Zigbee2MQTTFeatures["numeric"]>[];
};

//-- Utils

export type RGBColor = {
    r: number;
    g: number;
    b: number;
};
export type HueSaturationColor = {
    hue: number;
    saturation: number;
};

export type XYColor = {
    x: number;
    y: number;
};
export type AnyColor = RGBColor | XYColor | HueSaturationColor;
