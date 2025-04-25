import type React from "react";
import type { FunctionComponent, JSX, PropsWithChildren } from "react";

import type { CompositeFeature, Device, DeviceState, Endpoint, GenericFeature } from "../../../types.js";
import type { ValueWithLabelOrPrimitive } from "../../enum-editor/EnumEditor.js";
import Binary from "../binary/Binary.js";
import Climate from "../climate/Climate.js";
import Cover from "../cover/Cover.js";
import Enum from "../enum/Enum.js";
import Fan from "../fan/Fan.js";
import { Gradient } from "../gradient/Gradient.js";
import Light from "../light/Light.js";
import { List } from "../list/List.js";
import Lock from "../lock/Lock.js";
import Numeric from "../numeric/Numeric.js";
import Switch from "../switch/Switch.js";
import Text from "../text/Text.js";
import { Composite } from "./Composite.js";
import type { FeatureWrapperProps } from "./FeatureWrapper.js";
import Color from "./color/Color.js";

interface FeatureProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: CompositeFeature | GenericFeature;
    parentFeatures: (CompositeFeature | GenericFeature)[];
    deviceState: DeviceState;
    device: Device;
    steps?: ValueWithLabelOrPrimitive[];
    onChange(endpoint: Endpoint, value: Record<string, unknown>): void;
    onRead(endpoint: Endpoint, value: Record<string, unknown>): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
}

export const Feature = (props: FeatureProps): JSX.Element => {
    const { feature, device, deviceState, steps, onRead, onChange, featureWrapperClass: FeatureWrapper, minimal, parentFeatures } = props;
    const key = JSON.stringify(feature);
    const genericParams = {
        device,
        deviceState,
        onChange,
        onRead,
        featureWrapperClass: FeatureWrapper,
        minimal,
        parentFeatures,
    };
    const wrapperParams = { feature, onRead, deviceState, parentFeatures };

    switch (feature.type) {
        case "binary": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Binary feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "numeric": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Numeric feature={feature} key={key} {...genericParams} steps={steps} />
                </FeatureWrapper>
            );
        }
        case "list": {
            if (feature.name === "gradient" && feature.length_min != null && feature.length_max != null) {
                return (
                    <FeatureWrapper key={key} {...wrapperParams}>
                        <Gradient feature={feature} key={key} {...genericParams} />
                    </FeatureWrapper>
                );
            }

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <List feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "text": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Text feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "enum": {
            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Enum feature={feature} key={key} {...genericParams} />
                </FeatureWrapper>
            );
        }
        case "light": {
            return <Light feature={feature} key={key} {...genericParams} />;
        }
        case "switch": {
            return <Switch feature={feature} key={key} {...genericParams} />;
        }
        case "cover": {
            return <Cover feature={feature} key={key} {...genericParams} />;
        }
        case "lock": {
            return <Lock feature={feature} key={key} {...genericParams} />;
        }
        case "climate": {
            return <Climate feature={feature} key={key} {...genericParams} />;
        }
        case "fan": {
            return <Fan feature={feature} key={key} {...genericParams} />;
        }
        case "composite": {
            if (feature.name === "color_xy" || feature.name === "color_hs") {
                return (
                    <FeatureWrapper key={key} {...wrapperParams}>
                        <Color feature={feature} key={key} {...genericParams} />
                    </FeatureWrapper>
                );
            }

            // When parent is a list (this is when parentFeatures is not set), we don't
            // need to take the key of the deviceState (deviceState[feature.property])
            const specificDeviceState = parentFeatures ? (feature.property ? deviceState[feature.property] : deviceState) : deviceState;

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <Composite type="composite" feature={feature} key={key} {...genericParams} deviceState={specificDeviceState as DeviceState} />
                </FeatureWrapper>
            );
        }
        default: {
            console.error("Unsupported feature", feature);

            return (
                <FeatureWrapper key={key} {...wrapperParams}>
                    <pre>{JSON.stringify(feature, null, 4)}</pre>
                </FeatureWrapper>
            );
        }
    }
};
