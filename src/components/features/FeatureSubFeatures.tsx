import groupBy from "lodash/groupBy.js";
import { type JSX, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FeatureWithAnySubFeatures } from "../../types.js";
import Button from "../Button.js";
import { Feature } from "./Feature.js";
import type { BaseFeatureProps } from "./index.js";

interface FeatureSubFeaturesProps extends BaseFeatureProps<FeatureWithAnySubFeatures> {
    parentFeatures?: FeatureWithAnySubFeatures[];
    steps?: Record<string, unknown>;
    minimal?: boolean;
    showEndpointLabels?: boolean;
}

interface CompositeState {
    [key: string]: unknown;
}

const MAGIC_NO_ENDPOINT = "MAGIC_NO_ENDPOINT";

const getFeatureKey = (feature: FeatureSubFeaturesProps["feature"]) =>
    `${feature.type}-${feature.name}-${feature.label}-${feature.property}-${feature.access}-${feature.category}-${feature.endpoint}`;

export function FeatureSubFeatures(props: FeatureSubFeaturesProps) {
    const { feature, onChange, parentFeatures, onRead, device, deviceState, featureWrapperClass, minimal, showEndpointLabels = false } = props;
    const { type, property } = feature;
    const [state, setState] = useState<CompositeState>({});
    const { t } = useTranslation(["composite", "common"]);
    const combinedState = useMemo(() => ({ ...deviceState, ...state }), [deviceState, state]);
    const features = ("features" in feature && feature.features) || [];
    const isRoot = useMemo(() => {
        if (type === "composite" && parentFeatures !== undefined) {
            if (parentFeatures.length === 1) {
                return true;
            }

            if (parentFeatures.length === 2) {
                // When parent is e.g. climate
                const type = parentFeatures[1].type;

                return type != null && type !== "composite" && type !== "list";
            }
        }

        return false;
    }, [type, parentFeatures]);

    const onFeatureChange = useCallback(
        (value: Record<string, unknown>): void => {
            setState({ ...state, ...value });

            if (!isRoot) {
                if (type === "composite") {
                    onChange(property ? { [property]: { ...state, ...value } } : value);
                } else {
                    onChange(value);
                }
            }
        },
        [state, type, property, isRoot, onChange],
    );

    const onRootApply = useCallback((): void => {
        const newState = { ...deviceState, ...state };

        onChange(property ? { [property]: newState } : newState);
    }, [property, onChange, state, deviceState]);

    const onFeatureRead = useCallback(
        (prop: Record<string, unknown>): void => {
            if (type === "composite") {
                onRead?.(property ? { [property]: prop } : prop);
            } else {
                onRead?.(prop);
            }
        },
        [onRead, type, property],
    );

    const parentFeaturesOrEmpty = parentFeatures ?? [];
    const renderedFeatures: JSX.Element[] = [];

    if (!minimal) {
        const groupedFeatures = groupBy(features, (f) => f.endpoint ?? MAGIC_NO_ENDPOINT);

        if (groupedFeatures[MAGIC_NO_ENDPOINT]) {
            renderedFeatures.push(
                ...groupedFeatures[MAGIC_NO_ENDPOINT].map((f) => (
                    <Feature
                        // @ts-expect-error typing failure
                        key={getFeatureKey(f)}
                        // @ts-expect-error typing failure
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
        }

        for (const epName in groupedFeatures) {
            if (epName === MAGIC_NO_ENDPOINT) {
                continue;
            }

            const featuresGroup = groupedFeatures[epName];
            // do not indent groups with one element inside
            const noNeedIndent = featuresGroup.length === 1;

            renderedFeatures.push(
                <div key={epName}>
                    {showEndpointLabels ? `Endpoint: ${epName}` : null}
                    <div className={noNeedIndent ? "" : "ps-4"}>
                        {featuresGroup.map((featureGroup) => (
                            <Feature
                                // @ts-expect-error typing failure
                                key={getFeatureKey(featureGroup)}
                                // @ts-expect-error typing failure
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
                    // @ts-expect-error typing failure
                    key={getFeatureKey(subFeature)}
                    // @ts-expect-error typing failure
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

    return (
        <>
            {renderedFeatures}
            {isRoot && (
                <div>
                    <Button className={`btn btn-primary ${minimal ? " btn-sm" : ""}`} onClick={onRootApply}>
                        {t("common:apply")}
                    </Button>
                </div>
            )}
        </>
    );
}
