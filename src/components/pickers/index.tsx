import type { Cluster } from "../../types.js";

export const CLUSTER_DESCRIPTIONS = {
    genPowerCfg: "PowerCfg",
    genScenes: "Scenes",
    genOnOff: "OnOff",
    genLevelCtrl: "LevelCtrl",
    lightingColorCtrl: "LColorCtrl",
    closuresWindowCovering: "Closures",
    genMultistateInput: "MultistateInput",
    genGroups: "Groups",
    genOta: "Ota",
    touchlink: "Touchlink",
    genIdentify: "Identify",
    msTemperatureMeasurement: "Temperature",
    msIlluminanceMeasurement: "Illuminance",
    msRelativeHumidity: "Humidity",
    msPressureMeasurement: "Pressure",
    msSoilMoisture: "Soil Moisture",
};

export enum ClusterPickerType {
    MULTIPLE = 0,
    SINGLE = 1,
}

export interface ClusterGroup {
    name: string;
    clusters: Set<Cluster>;
}

export interface ClusterPickerProps {
    disabled?: boolean;
    value: Cluster[] | Cluster;
    label?: string;
    onChange(arg1: Cluster[] | Cluster | undefined): void;
    clusters: Cluster[] | ClusterGroup[];
    pickerType: ClusterPickerType;
}

interface ClusterGenericPickerProps {
    onChange(arg1: Cluster[] | Cluster | undefined): void;
    label?: string;
    disabled?: boolean;
}
export interface ClusterMultiPickerProps extends ClusterGenericPickerProps {
    clusters: Cluster[];
    value: Cluster[];
}
export interface ClusterSinglePickerProps extends ClusterGenericPickerProps {
    clusters: Cluster[] | ClusterGroup[];
    value: Cluster;
}

export function isClusterGroup(clusters: Cluster[] | ClusterGroup[]): clusters is ClusterGroup[] {
    return clusters.length > 0 && typeof clusters[0] !== "string";
}
