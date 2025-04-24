import type React from "react";
import type { FunctionComponent, JSX, PropsWithChildren } from "react";

import type { CompositeFeature, Device, DeviceState, Endpoint, GenericExposedFeature } from "../../../types.js";
import {
    isBinaryFeature,
    isClimateFeature,
    isColorFeature,
    isCompositeFeature,
    isCoverFeature,
    isEnumFeature,
    isFanFeature,
    isGradientFeature,
    isLightFeature,
    isListFeature,
    isLockFeature,
    isNumericFeature,
    isSwitchFeature,
    isTextualFeature,
} from "../../device-page/index.js";
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
import Textual from "../textual/Textual.js";
import { Composite } from "./Composite.js";
import type { FeatureWrapperProps } from "./FeatureWrapper.js";
import Color from "./color/Color.js";

interface FeatureProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    feature: CompositeFeature | GenericExposedFeature;
    parentFeatures: (CompositeFeature | GenericExposedFeature)[];
    deviceState: DeviceState;
    device: Device;
    stepsConfiguration?: Record<string, unknown>;
    onChange(endpoint: Endpoint, value: Record<string, unknown>): void;
    onRead(endpoint: Endpoint, value: Record<string, unknown>): void;
    featureWrapperClass: FunctionComponent<PropsWithChildren<FeatureWrapperProps>>;
    minimal?: boolean;
}

export const Feature = (props: FeatureProps): JSX.Element => {
    const {
        feature,
        device,
        deviceState,
        stepsConfiguration,
        onRead,
        onChange,
        featureWrapperClass: FeatureWrapper,
        minimal,
        parentFeatures,
    } = props;

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

    if (isBinaryFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Binary feature={feature} key={key} {...genericParams} />
            </FeatureWrapper>
        );
    }
    if (isNumericFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Numeric feature={feature} key={key} {...genericParams} steps={stepsConfiguration?.[feature.name] as ValueWithLabelOrPrimitive[]} />
            </FeatureWrapper>
        );
    }
    if (isGradientFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Gradient feature={feature} key={key} {...genericParams} />
            </FeatureWrapper>
        );
    }
    if (isListFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <List feature={feature} key={key} {...genericParams} />
            </FeatureWrapper>
        );
    }
    if (isTextualFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Textual feature={feature} key={key} {...genericParams} />
            </FeatureWrapper>
        );
    }
    if (isEnumFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Enum feature={feature} key={key} {...genericParams} />
            </FeatureWrapper>
        );
    }
    if (isLightFeature(feature)) {
        return <Light feature={feature} key={key} {...genericParams} />;
    }
    if (isSwitchFeature(feature)) {
        return <Switch feature={feature} key={key} {...genericParams} />;
    }
    if (isCoverFeature(feature)) {
        return <Cover feature={feature} key={key} {...genericParams} />;
    }
    if (isLockFeature(feature)) {
        return <Lock feature={feature} key={key} {...genericParams} />;
    }
    if (isColorFeature(feature)) {
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Color feature={feature} key={key} {...genericParams} />
            </FeatureWrapper>
        );
    }
    if (isClimateFeature(feature)) {
        return <Climate feature={feature} key={key} {...genericParams} />;
    }
    if (isFanFeature(feature)) {
        return <Fan feature={feature} key={key} {...genericParams} />;
    }
    if (isCompositeFeature(feature)) {
        // When parent is a list (this is when parentFeatures is not set), we don't
        // need to take the key of the deviceState (deviceState[feature.property])
        const specificDeviceState = parentFeatures ? (feature.property ? deviceState[feature.property] : deviceState) : deviceState;
        return (
            <FeatureWrapper key={key} {...wrapperParams}>
                <Composite type="composite" feature={feature} key={key} {...genericParams} deviceState={specificDeviceState as DeviceState} />
            </FeatureWrapper>
        );
    }
    return (
        <FeatureWrapper key={key} {...wrapperParams}>
            <pre>{JSON.stringify(feature, null, 4)}</pre>
        </FeatureWrapper>
    );
};
