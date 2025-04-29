import groupBy from "lodash/groupBy.js";
import { type JSX, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CompositeFeature, GenericFeature } from "../../types.js";
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

const MAGIC_NO_ENDPOINT = "MAGIC_NO_ENDPOINT";

const isCompositeRoot = (feature: CompositeFeature, parentFeatures: (CompositeFeature | GenericFeature)[] | undefined): boolean => {
    return (
        isCompositeFeature(feature) &&
        parentFeatures !== undefined &&
        (parentFeatures.length === 1 ||
            // When parent is e.g. climate
            (parentFeatures.length === 2 && ![null, undefined, "composite", "list"].includes(parentFeatures[1].type)))
    );
};

export function Composite(props: CompositeProps) {
    const { feature, onChange, parentFeatures, onRead, device, deviceState, featureWrapperClass, minimal, showEndpointLabels = false } = props;
    const { features = [] } = feature;
    const [state, setState] = useState<CompositeState>({});
    const { t } = useTranslation(["composite", "common"]);
    const combinedState = useMemo(() => ({ ...deviceState, ...state }), [deviceState, state]);

    const onFeatureChange = useCallback(
        (value: Record<string, unknown>): void => {
            setState({ ...state, ...value });

            if (!isCompositeRoot(feature, parentFeatures)) {
                if (isCompositeFeature(feature)) {
                    onChange(feature.property ? { [feature.property]: { ...state, ...value } } : value);
                } else {
                    onChange(value);
                }
            }
        },
        [state, feature, parentFeatures, onChange],
    );

    const onCompositeFeatureApply = useCallback((): void => {
        const newState = { ...deviceState, ...state };

        onChange(feature.property ? { [feature.property]: newState } : newState);
    }, [feature.property, onChange, state, deviceState]);

    const onFeatureRead = useCallback(
        (property: Record<string, unknown>): void => {
            if (isCompositeFeature(feature)) {
                onRead?.(feature.property ? { [feature.property]: property } : property);
            } else {
                onRead?.(property);
            }
        },
        [onRead, feature],
    );

    const parentFeaturesOrEmpty = parentFeatures ?? [];
    const renderedFeatures: JSX.Element[] = [];

    if (!minimal) {
        const groupedFeatures = groupBy(features, (f) => f.endpoint ?? MAGIC_NO_ENDPOINT);

        if (groupedFeatures[MAGIC_NO_ENDPOINT]) {
            renderedFeatures.push(
                ...groupedFeatures[MAGIC_NO_ENDPOINT].map((f) => (
                    <Feature
                        key={JSON.stringify(f)}
                        feature={f}
                        parentFeatures={[...parentFeaturesOrEmpty, feature]}
                        device={device}
                        deviceState={combinedState}
                        onChange={onFeatureChange}
                        onRead={onFeatureRead}
                        featureWrapperClass={featureWrapperClass}
                        minimal={minimal}
                    />
                )),
            );
            delete groupedFeatures[MAGIC_NO_ENDPOINT];
        }

        for (const epName in groupedFeatures) {
            const featuresGroup = groupedFeatures[epName];
            // do not indent groups with one element inside
            const noNeedIndent = featuresGroup.length === 1;

            renderedFeatures.push(
                <div key={epName}>
                    {showEndpointLabels ? `Endpoint: ${epName}` : null}
                    <div className={noNeedIndent ? "" : "ps-4"}>
                        {featuresGroup.map((featureGroup) => (
                            <Feature
                                key={featureGroup.name + featureGroup.endpoint}
                                feature={featureGroup}
                                parentFeatures={parentFeaturesOrEmpty}
                                device={device}
                                deviceState={combinedState}
                                onChange={onFeatureChange}
                                onRead={onFeatureRead}
                                featureWrapperClass={featureWrapperClass}
                                minimal={minimal}
                            />
                        ))}
                    </div>
                </div>,
            );
        }
    } else {
        for (const subFeature of features) {
            renderedFeatures.push(
                <Feature
                    key={JSON.stringify(subFeature)}
                    feature={subFeature}
                    parentFeatures={parentFeaturesOrEmpty}
                    device={device}
                    deviceState={combinedState}
                    onChange={onFeatureChange}
                    onRead={onFeatureRead}
                    featureWrapperClass={featureWrapperClass}
                    minimal={minimal}
                />,
            );
        }
    }

    if (isCompositeRoot(feature, parentFeatures)) {
        renderedFeatures.push(
            <div key={`${feature.name}apply`}>
                <Button className={`btn btn-primary float-end${minimal ? " btn-sm" : ""}`} onClick={onCompositeFeatureApply}>
                    {t("common:apply")}
                </Button>
            </div>,
        );
    }

    return renderedFeatures;
}
