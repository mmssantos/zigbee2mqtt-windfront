import { diff } from "deep-object-diff";
import { saveAs } from "file-saver";
import type { Device, DeviceState, Endpoint, Group, LastSeenType } from "./types.js";

export const genDeviceDetailsLink = (deviceIdentifier: string | number): string => `/device/${deviceIdentifier}`;

export const toHex = (input: number, padding = 4): string => {
    const padStr = "0".repeat(padding);
    return `0x${(padStr + input.toString(16)).slice(-1 * padding).toUpperCase()}`;
};

export const toHHMMSS = (secs: number): string => {
    if (!secs) {
        return "N/A";
    }
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor(secs / 60) % 60;
    const seconds = Math.floor(secs % 60);

    return [hours, minutes, seconds]
        .map((v) => (v < 10 ? `0${v}` : v))
        .filter((v, i) => v !== "00" || i > 0)
        .join(":");
};

export const lastSeen = (state: DeviceState, lastSeenType: LastSeenType): Date | undefined => {
    if (!state.last_seen) {
        return undefined;
    }
    switch (lastSeenType) {
        case "ISO_8601":
        case "ISO_8601_local":
            return new Date(Date.parse(state.last_seen as string));

        case "epoch":
            return new Date(state.last_seen as number);

        case "disable":
            return undefined;

        default:
            console.warn(`Unknown last_seen type ${lastSeenType}`);
            return undefined;
    }
};

export function padTo2Digits(num: number): string {
    return num.toString().padStart(2, "0");
}

export function formatDate(date: Date): string {
    return `${[date.getFullYear(), padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate())].join("-")} ${[padTo2Digits(date.getHours()), padTo2Digits(date.getMinutes()), padTo2Digits(date.getSeconds())].join(":")}`;
}

export const getDeviceDisplayName = (device: Device): string => {
    const model = device.definition?.model ? `(${device.definition?.model})` : "";
    return `${device.friendly_name} ${model}`;
};

export const randomString = (len: number): string =>
    Math.random()
        .toString(36)
        .slice(2, 2 + len);

export const isSecurePage = (): boolean => location.protocol === "https:";

export const scale = (inputY: number, yRange: Array<number>, xRange: Array<number>): number => {
    const [xMin, xMax] = xRange;
    const [yMin, yMax] = yRange;

    const percent = (inputY - yMin) / (yMax - yMin);
    return percent * (xMax - xMin) + xMin;
};

export const download = async (data: Record<string, unknown>, filename: string) => {
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    zip.file(filename, JSON.stringify(data, null, 4), { compression: "DEFLATE" });
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${filename}.zip`);
};

export const computeSettingsDiff = (before: object, after: object) => {
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

export const sanitizeZ2MDeviceName = (deviceName?: string): string => (deviceName ? deviceName.replace(/:|\s|\//g, "-") : "NA");

export const getEndpoints = (obj: Device | Group): Endpoint[] => {
    let eps: Endpoint[] = [];
    if (!obj) {
        return eps;
    }
    if ((obj as Device).endpoints) {
        eps = eps.concat(Object.keys((obj as Device).endpoints) as Endpoint[]);
    } else if ((obj as Group).members) {
        eps = eps.concat((obj as Group).members.map((g) => g.endpoint));
    }
    if ((obj as Device).definition?.exposes) {
        eps = eps.concat((obj as Device).definition?.exposes?.map((e) => e.endpoint).filter(Boolean) as Endpoint[]);
    }
    return eps;
};

export const stringifyWithPreservingUndefinedAsNull = (data: Record<string, unknown>): string =>
    JSON.stringify(data, (_k, v) => (v === undefined ? null : v));

export const isOnlyOneBitIsSet = (b: number): number | boolean => {
    return b && !(b & (b - 1));
};

export const isIframe = (): boolean => window.location !== window.parent.location;

export const supportNewDevicesUrl = "https://www.zigbee2mqtt.io/advanced/support-new-devices/01_support_new_devices.html";
