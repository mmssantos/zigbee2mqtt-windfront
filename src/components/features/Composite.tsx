import groupBy from "lodash/groupBy.js";
import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompositeFeature, Endpoint, GenericFeature } from "../../types.js";
import Button from "../button/Button.js";
import { isCompositeFeature } from "../device-page/index.js";
import { Feature } from "./Feature.js";
import type { BaseFeatureProps } from "./index.js";

type CompositeType = "composite" | "light" | "switch" | "cover" | "lock" | "fan" | "climate";

interface CompositeProps extends BaseFeatureProps<CompositeFeature> {
    type: CompositeType;
    parentFeatures?: (CompositeFeature | GenericFeature)[];
    stepsConfiguration?: Record<string, unknown>;
    minimal?: boolean;
    showEndpointLabels?: boolean;
}

interface CompositeState {
    [key: string]: unknown;
}

export function Composite(props: CompositeProps) {
    const [state, setState] = useState<CompositeState>({});
    const { t } = useTranslation(["composite", "common"]);

    const onChange = (endpoint: Endpoint, value: Record<string, unknown>): void => {
        setState({ ...state, ...value });

        if (!isCompositeRoot()) {
            if (isCompositeFeature(props.feature)) {
                props.onChange(endpoint, props.feature.property ? { [props.feature.property]: { ...state, ...value } } : value);
            } else {
                props.onChange(endpoint, value);
            }
        }
    };

    const isCompositeRoot = (): boolean => {
        return (
            isCompositeFeature(props.feature) &&
            props.parentFeatures !== undefined &&
            (props.parentFeatures.length === 1 ||
                // When parent is e.g. climate
                (props.parentFeatures.length === 2 && ![null, undefined, "composite", "list"].includes(props.parentFeatures[1].type)))
        );
    };

    const onCompositeFeatureApply = (): void => {
        const newState = { ...props.deviceState, ...state };
        props.onChange(props.feature.endpoint as Endpoint, props.feature.property ? { [props.feature.property]: newState } : newState);
    };

    const onRead = (endpoint: Endpoint, property: Record<string, unknown>): void => {
        if (isCompositeFeature(props.feature)) {
            props.onRead?.(endpoint, props.feature.property ? { [props.feature.property]: property } : property);
        } else {
            props.onRead?.(endpoint, property);
        }
    };

    const magicNoEndpoint = "MAGIC_NO_ENDPOINT";
    const { showEndpointLabels = false, feature, device, deviceState, featureWrapperClass, minimal } = props;
    const { features = [] } = feature;
    const parentFeatures = props.parentFeatures ?? [];
    const doGroupingByEndpoint = !minimal;
    let result = [] as JSX.Element[];
    const combinedState = { ...deviceState, ...state };

    if (doGroupingByEndpoint) {
        const groupedFeatures = groupBy(features, (f) => f.endpoint ?? magicNoEndpoint);

        if (groupedFeatures[magicNoEndpoint]) {
            result.push(
                ...groupedFeatures[magicNoEndpoint].map((f) => (
                    <Feature
                        key={JSON.stringify(f)}
                        feature={f}
                        parentFeatures={[...parentFeatures, feature]}
                        device={device}
                        deviceState={combinedState}
                        onChange={onChange}
                        onRead={onRead}
                        featureWrapperClass={featureWrapperClass}
                        minimal={minimal}
                    />
                )),
            );
            delete groupedFeatures[magicNoEndpoint];
        }

        for (const epName in groupedFeatures) {
            const featuresGroup = groupedFeatures[epName];
            // do not indent groups with one element inside
            const noNeedIndent = featuresGroup.length === 1;

            result.push(
                <div key={epName}>
                    {showEndpointLabels ? `Endpoint: ${epName}` : null}
                    <div className={noNeedIndent ? "" : "ps-4"}>
                        {featuresGroup.map((f) => (
                            <Feature
                                key={f.name + f.endpoint}
                                feature={f}
                                parentFeatures={parentFeatures}
                                device={device}
                                deviceState={combinedState}
                                onChange={onChange}
                                onRead={onRead}
                                featureWrapperClass={featureWrapperClass}
                                minimal={minimal}
                            />
                        ))}
                    </div>
                </div>,
            );
        }
    } else {
        const renderedFeatures = features.map((f) => (
            <Feature
                key={JSON.stringify(f)}
                feature={f}
                parentFeatures={parentFeatures}
                device={device}
                deviceState={combinedState}
                onChange={onChange}
                onRead={onRead}
                featureWrapperClass={featureWrapperClass}
                minimal={minimal}
            />
        ));
        result = result.concat(renderedFeatures);
    }

    if (isCompositeRoot()) {
        result.push(
            <div key={`${feature.name}apply`}>
                <Button className={`btn btn-primary float-end${minimal ? " btn-sm" : ""}`} onClick={onCompositeFeatureApply}>
                    {t("common:apply")}
                </Button>
            </div>,
        );
    }
    return result;
}
