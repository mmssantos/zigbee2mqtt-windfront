import type { FunctionComponent, HTMLAttributes, PropsWithChildren } from "react";
import type { Device, DeviceState, Endpoint } from "../../types.js";
import type { FeatureWrapperProps } from "./composite/FeatureWrapper.js";

export interface BaseFeatureProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: T;
    deviceState: DeviceState;
    device: Device;
    onChange(endpoint: Endpoint, value: Record<string, unknown> | unknown): void;
    onRead?(endpoint: Endpoint, value: Record<string, unknown> | unknown): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
}
