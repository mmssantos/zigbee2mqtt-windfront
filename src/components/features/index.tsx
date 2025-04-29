import type { FunctionComponent, HTMLAttributes, PropsWithChildren } from "react";
import type { Device, DeviceState } from "../../types.js";
import type { FeatureWrapperProps } from "./FeatureWrapper.js";

export interface BaseFeatureProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: T;
    deviceState: DeviceState;
    device: Device;
    onChange(value: Record<string, unknown> | unknown): void;
    onRead?(value: Record<string, unknown> | unknown): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
}
