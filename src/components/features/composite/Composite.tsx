import cx from "classnames";
import groupBy from "lodash/groupBy.js";
import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompositeFeature, Endpoint, GenericExposedFeature } from "../../../types.js";
import Button from "../../button/Button.js";
import { isCompositeFeature } from "../../device-page/index.js";
import type { BaseFeatureProps } from "../index.js";
import { Feature } from "./Feature.js";

type CompositeType = "composite" | "light" | "switch" | "cover" | "lock" | "fan" | "climate";

interface CompositeProps extends BaseFeatureProps<CompositeFeature> {
    type: CompositeType;
    parentFeatures?: (CompositeFeature | GenericExposedFeature)[];
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
        const { onChange, feature } = props;
        setState({ ...state, ...value });
        if (!isCompositeRoot()) {
            if (isCompositeFeature(feature)) {
                onChange(endpoint, feature.property ? { [feature.property]: { ...state, ...value } } : value);
            } else {
                onChange(endpoint, value);
            }
        }
    };

    const isCompositeRoot = (): boolean => {
        const { parentFeatures } = props;
        return (
            isCompositeFeature(props.feature) &&
            parentFeatures !== undefined &&
            (parentFeatures.length === 1 ||
                // When parent is e.g. climate
                (parentFeatures.length === 2 && ![null, undefined, "composite", "list"].includes(parentFeatures[1].type)))
        );
    };

    const onCompositeFeatureApply = (): void => {
        const {
            deviceState,
            onChange,
            feature: { endpoint, property },
        } = props;
        const newState = { ...deviceState, ...state };
        onChange(endpoint as Endpoint, property ? { [property]: newState } : newState);
    };

    const onRead = (endpoint: Endpoint, property: Record<string, unknown>): void => {
        const { onRead, feature } = props;
        if (isCompositeFeature(feature)) {
            onRead?.(endpoint, feature.property ? { [feature.property]: property } : property);
        } else {
            onRead?.(endpoint, property);
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
                <Button className={cx("btn btn-primary float-end", { "btn-sm": minimal })} onClick={onCompositeFeatureApply}>
                    {t("common:apply")}
                </Button>
            </div>,
        );
    }
    return result;
}
