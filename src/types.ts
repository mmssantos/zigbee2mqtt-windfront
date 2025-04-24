import type { RJSFSchema } from "@rjsf/utils";
import type { Zigbee2MQTTResponse, Zigbee2MQTTResponseEndpoints } from "zigbee2mqtt/dist/types/api.js";
import type { LogMessage } from "./store.js";

export type DeviceType = "Coordinator" | "Router" | "EndDevice" | "Unknown" | "GreenPower";
export type FriendlyName = string;
export type IEEEEAddress = string;

export type OTAState = {
    state: "available" | "updating" | "scheduled";
    progress: number;
    remaining: number;
};
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
export type DeviceState = Record<string, unknown>;
export type Cluster = string | number;
export type Attribute = string;

export type Endpoint = string | number;

export interface AttributeDefinition {
    ID: number;
    type: number;
    manufacturerCode?: number;
}
export interface Parameter {
    name: string;
    type: number;
    conditions?: Record<string, unknown>[];
}
export interface CommandDefinition {
    ID: number;
    parameters: Parameter[];
    response?: number;
}

export interface ClusterDefinition {
    ID: number;
    name?: string;
    manufacturerCode?: number;
    attributes: Record<string, AttributeDefinition>;
    commands: Record<string, CommandDefinition>;
    commandsResponse: Record<string, CommandDefinition>;
}

// biome-ignore lint/suspicious/noExplicitAny: tmp
type CustomClusters = Record<string, any>;

export interface BridgeDefinitions {
    clusters: Record<Cluster, ClusterDefinition>;
    custom_clusters: Record<IEEEEAddress, CustomClusters>;
}

export interface Meta {
    revision: number;
    transportrev: number;
    product: number;
    majorrel: number;
    minorrel: number;
    maintrel: number;
}

export interface Coordinator {
    type: string;
    meta: Meta;
}

export interface Network {
    channel: number;
    pan_id: number;
    extended_pan_id: number[];
}

export type DeviceConfig = Record<string, unknown>;
export interface AdvancedConfig {
    log_level: LogMessage["level"];
    elapsed: boolean;
    last_seen: "disable" | "ISO_8601" | "ISO_8601_local" | "epoch";
}
export interface FrontendConfig {
    notification_filter?: string[];
}
export interface Z2MConfig {
    homeassistant?: {
        enabled: boolean;
    };
    availability?: {
        enabled: boolean;
    };
    advanced: AdvancedConfig;
    devices: Record<string, DeviceConfig>;
    device_options: DeviceConfig;
    frontend: FrontendConfig;
    [k: string]: unknown;
}
export type BridgeState = "online" | "offline";
export interface BridgeInfo {
    config: Z2MConfig;
    config_schema: RJSFSchema;
    permit_join: boolean;
    permit_join_end: number | undefined | null;
    commit?: string;
    version: string;
    zigbee_herdsman_converters: { version: string };
    zigbee_herdsman: { version: string };
    coordinator: {
        meta: {
            revision?: string;
            [key: string]: unknown;
        };
        type: string;
        ieee_address: string;
    };
    device_options: Record<IEEEEAddress, unknown>;
    restart_required: boolean;
}

export type PowerSource =
    | "Unknown"
    | "Mains (single phase)"
    | "Mains (3 phase)"
    | "Battery"
    | "DC Source"
    | "Emergency mains constantly powered"
    | "Emergency mains and transfer switch";

export type GenericFeatureType = "numeric" | "binary" | "enum" | "text" | "list";
export type CompositeFeatureType = "fan" | "light" | "switch" | "cover" | "lock" | "composite" | "climate";

export enum FeatureAccessMode {
    NONE = 0,
    ACCESS_STATE = 0b001,
    ACCESS_WRITE = 0b010,
    ACCESS_READ = 0b100,
}
export interface GenericExposedFeature {
    type: GenericFeatureType;
    name: string;
    label: string;
    unit?: string;
    access: FeatureAccessMode;
    endpoint?: Endpoint;
    property?: string;
    description?: string;
}

export interface BinaryFeature extends GenericExposedFeature {
    type: "binary";
    value_on: unknown;
    value_off: unknown;
    value_toggle?: unknown;
}

export interface ListFeature extends GenericExposedFeature {
    type: "list";
    // bad design decision
    item_type: "number" | GenericOrCompositeFeature;

    length_min?: number;
    length_max?: number;
}

export interface CompositeFeature extends Omit<GenericExposedFeature, "type"> {
    type: CompositeFeatureType;
    features: GenericOrCompositeFeature[];
}

export type GenericOrCompositeFeature = GenericExposedFeature | CompositeFeature;

export interface NumericFeaturePreset {
    name: string;
    value: number;
    description?: string;
}
export interface NumericFeature extends GenericExposedFeature {
    type: "numeric";
    value_min?: number;
    value_max?: number;
    value_step?: number;
    presets?: NumericFeaturePreset[];
}

export interface TextualFeature extends GenericExposedFeature {
    type: "text";
}

export interface EnumFeature extends GenericExposedFeature {
    type: "enum";
    values: unknown[];
}

export interface GradientFeature extends GenericExposedFeature {
    type: "text";
    name: "gradient";
    length_min: number;
    length_max: number;
}

export interface LightFeature extends CompositeFeature {
    type: "light";
}

export interface SwitchFeature extends CompositeFeature {
    type: "switch";
}

export interface CoverFeature extends CompositeFeature {
    type: "cover";
}

export interface LockFeature extends CompositeFeature {
    type: "lock";
}
export interface FanFeature extends CompositeFeature {
    type: "fan";
}

export interface ClimateFeature extends CompositeFeature {
    type: "climate";
}

export interface ColorFeature extends CompositeFeature {
    type: "composite";
    name: "color_xy" | "color_hs";
    features: NumericFeature[];
}

export interface DeviceDefinition {
    model: string;
    vendor: string;
    description: string;
    supports_ota: boolean;
    icon: string;
    exposes: GenericOrCompositeFeature[];
    options: GenericOrCompositeFeature[];
}

export interface ReportingConfig {
    cluster: Cluster;
    attribute: Attribute;
    maximum_report_interval: number;
    minimum_report_interval: number;
    reportable_change: number;
}

export interface EndpointDescription {
    bindings: BindRule[];
    configured_reportings: ReportingConfig[];
    clusters: {
        input: Cluster[];
        output: Cluster[];
    };
    scenes: Scene[];
}

export interface WithFriendlyName {
    friendly_name: FriendlyName;
}

export interface GroupMember {
    ieee_address: IEEEEAddress;
    endpoint: Endpoint;
}

export type Scene = {
    id: number;
    name: string;
};

export interface Group extends WithFriendlyName {
    id: number;
    members: GroupMember[];
    description: string | undefined | null;
    scenes: Scene[];
}

export enum InterviewState {
    Pending = "PENDING",
    InProgress = "IN_PROGRESS",
    Successful = "SUCCESSFUL",
    Failed = "FAILED",
}

export interface Device extends WithFriendlyName {
    ieee_address: IEEEEAddress;
    type: DeviceType;
    network_address: number;
    supported: boolean;
    friendly_name: string;
    disabled: boolean;
    description: string | undefined | null;
    definition: DeviceDefinition | undefined | null;
    power_source: PowerSource | undefined | null;
    software_build_id: string | undefined | null;
    date_code: string | undefined | null;
    model_id: string | undefined | null;
    interview_state: InterviewState;
    manufacturer: string | undefined | null;
    endpoints: Record<Endpoint, EndpointDescription>;
}

export type ObjectType = "device" | "group";
export interface BindRule {
    cluster: Cluster;
    target: {
        id?: number;
        endpoint?: Endpoint;
        ieee_address?: IEEEEAddress;
        type: "endpoint" | "group";
    };
}

export interface TouchLinkDevice {
    ieee_address: IEEEEAddress;
    channel: number;
}

export type LastSeenType = "disable" | "ISO_8601" | "ISO_8601_local" | "epoch";

export interface Message<T = string | Record<string, unknown> | Record<string, unknown>[] | string[]> {
    topic: string;
    payload: T;
}

export interface ResponseMessage<T extends Zigbee2MQTTResponseEndpoints> extends Message {
    payload: Zigbee2MQTTResponse<T>;
}
