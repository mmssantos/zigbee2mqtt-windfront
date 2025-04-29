import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type PropsWithChildren, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type CompositeFeature, type DeviceState, FeatureAccessMode, type GenericFeature } from "../../types.js";
import Button from "../button/Button.js";
import { isColorFeature } from "../device-page/index.js";

export type FeatureWrapperProps = {
    feature: CompositeFeature | GenericFeature;
    parentFeatures: (CompositeFeature | GenericFeature)[];
    deviceState?: DeviceState;
    onRead(property: Record<string, unknown>): void;
};
export default function FeatureWrapper(props: PropsWithChildren<FeatureWrapperProps>) {
    const { t } = useTranslation(["featureDescriptions", "featureNames"]);
    const { children, feature, onRead } = props;
    const isColor = isColorFeature(feature);
    const isReadable = (feature.property && feature.access & FeatureAccessMode.GET) || isColor;
    const parentFeature = props.parentFeatures?.[props.parentFeatures.length - 1];
    let label = feature.label || t(`featureNames:${feature.name}`);

    if (parentFeature?.label && feature.name === "state" && !["light", "switch"].includes(parentFeature.type)) {
        label = `${parentFeature.label} ${feature.label.charAt(0).toLowerCase()}${feature.label.slice(1)}`;
    }

    const onSyncClick = useCallback(
        (item: CompositeFeature | GenericFeature) => {
            if (item.property) {
                onRead({ [item.property]: "" });
            }
        },
        [onRead],
    );

    return (
        <div className="stat bg-base-100 border border-base-300">
            <div className="stat-title">{label}</div>
            <div className="stat-value">{children}</div>
            {feature.description && <div className="stat-desc">{t(feature.description)}</div>}
            {isReadable && (
                <div className="stat-actions">
                    <Button<CompositeFeature | GenericFeature> item={feature} onClick={onSyncClick} className="btn btn-xs btn-primary">
                        <FontAwesomeIcon icon={faSync} />
                    </Button>
                </div>
            )}
        </div>
    );
}
