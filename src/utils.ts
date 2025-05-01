import { diff } from "deep-object-diff";
import { saveAs } from "file-saver";
import type { Device, DeviceState, Group, LastSeenConfig } from "./types.js";

// #region Compute

export const scale = (inputY: number, yRange: Array<number>, xRange: Array<number>): number => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    const percent = (inputY - yMin) / (yMax - yMin);
    return percent * (xMax - xMin) + xMin;
};

export const isOnlyOneBitIsSet = (b: number): number | boolean => {
    return b && !(b & (b - 1));
};

export const randomString = (len: number): string =>
    Math.random()
        .toString(36)
        .slice(2, 2 + len);

// TODO: revamp this whole logic (SettingsPage)
export const computeSettingsDiff = (before: Record<string, unknown>, after: Record<string, unknown>) => {
    let diffObj = diff(before, after);

    // diff converts arrays to objects, set original array back here
    const setArrays = (localAfter: object, localDiff: object): void => {
        for (const [key, value] of Object.entries(localDiff)) {
            if (typeof value === "object") {
                if (Array.isArray(localAfter[key])) {
                    localDiff[key] = localAfter[key];
                } else {
                    setArrays(localAfter[key], value);
                }
            }
        }
    };

    if (Array.isArray(after)) {
        diffObj = after;
    } else {
        setArrays(after, diffObj);
    }

    return diffObj;
};

export const getObjectFirstKey = <T>(object: T): string | undefined => {
    for (const key in object) {
        return key;
    }
};

// #endregion

// #region Format/Convert

export const stringifyWithPreservingUndefinedAsNull = (data: Record<string, unknown>): string =>
    JSON.stringify(data, (_k, v) => (v === undefined ? null : v));

export const lastSeen = (state: DeviceState, lastSeenConfig: LastSeenConfig): Date | undefined => {
    if (!state.last_seen) {
        return undefined;
    }

    switch (lastSeenConfig) {
        case "ISO_8601":
        case "ISO_8601_local":
            return new Date(Date.parse(state.last_seen as string));

        case "epoch":
            return new Date(state.last_seen as number);

        case "disable":
            return undefined;

        default:
            console.warn(`Unknown last_seen type ${lastSeenConfig}`);
            return undefined;
    }
};

export function formatDate(date: Date): string {
    return `${[date.getFullYear(), padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate())].join("-")} ${[padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes()), padTo2Digits(date.getSeconds())].join(":")}`;
}

export const toHex = (input: number, padding = 4): string => {
    const padStr = "0".repeat(padding);
    return `0x${(padStr + input.toString(16)).slice(-1 * padding).toUpperCase()}`;
};

export function padTo2Digits(num: number): string {
    return num.toString().padStart(2, "0");
}

export const sanitizeZ2MDeviceName = (deviceName?: string): string | "NA" => (deviceName ? deviceName.replace(/:|\s|\//g, "-") : "NA");

export const getDeviceDisplayName = (device: Device): string => {
    const model = device.definition?.model ? `(${device.definition?.model})` : "";
    return `${device.friendly_name} ${model}`;
};

// #endregion

// #region Device/Group

export function isDevice(entity: Device | Group): entity is Device {
    return !("members" in entity);
}

export function isGroup(entity: Device | Group): entity is Group {
    return "members" in entity;
}

export const getEndpoints = (entity?: Device | Group): Set<string | number> => {
    const endpoints = new Set<string | number>();

    if (!entity) {
        return endpoints;
    }

    if (isDevice(entity)) {
        for (const key in entity.endpoints) {
            endpoints.add(Number.parseInt(key, 10));
        }

        if (entity.definition?.exposes) {
            for (const expose of entity.definition.exposes) {
                if (expose.endpoint) {
                    endpoints.add(expose.endpoint);
                }
            }
        }
    } else {
        for (const member of entity.members) {
            endpoints.add(member.endpoint);
        }
    }

    return endpoints;
};

// #endregion

// #region Browser

export const isSecurePage = (): boolean => location.protocol === "https:";

export const isIframe = (): boolean => window.location !== window.parent.location;

export const download = async (data: Record<string, unknown>, filename: string) => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    zip.file(filename, JSON.stringify(data, null, 4), { compression: "DEFLATE" });

    const content = await zip.generateAsync({ type: "blob" });

    saveAs(content, `${filename}.zip`);
};

// #endregion
