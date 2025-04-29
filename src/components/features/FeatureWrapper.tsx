import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import camelCase from "lodash/camelCase.js";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type CompositeFeature, type DeviceState, FeatureAccessMode, type GenericFeature } from "../../types.js";
import Button from "../button/Button.js";
import { isColorFeature } from "../device-page/index.js";
import { getGenericFeatureIcon } from "./index.js";

export type FeatureWrapperProps = {
    feature: CompositeFeature | GenericFeature;
    parentFeatures: (CompositeFeature | GenericFeature)[];
    deviceState?: DeviceState;
    onRead(property: Record<string, unknown>): void;
};
export default function FeatureWrapper(props: PropsWithChildren<FeatureWrapperProps>) {
    const { t } = useTranslation(["featureDescriptions", "featureNames"]);
    const { children, feature, deviceState = {}, onRead } = props;
    const fi = useMemo(
        () => getGenericFeatureIcon(feature.name, deviceState[feature.property!], "unit" in feature ? feature.unit : undefined),
        [feature, deviceState],
    );
    const isReadable = (feature.property && feature.access & FeatureAccessMode.GET) || isColorFeature(feature);
    const parentFeature = props.parentFeatures?.[props.parentFeatures.length - 1];
    const featureName = feature.name === "state" ? feature.property : feature.name;
    let label = feature.label || t(`featureNames:${featureName}`, { defaultValue: startCase(camelCase(featureName)) });

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
            <div className="stat-figure">{fi && <FontAwesomeIcon icon={fi[0]} fixedWidth className={fi[1]} {...fi[2]} size="2xl" />}</div>
            <div className="stat-title">{label}</div>
            <div className="stat-value">{children}</div>
            {feature.description && <div className="stat-desc">{t(feature.description)}</div>}
            {isReadable && (
                <div className="stat-actions mt-1.5">
                    <Button<CompositeFeature | GenericFeature> item={feature} onClick={onSyncClick} className="btn btn-xs btn-square btn-primary">
                        <FontAwesomeIcon icon={faSync} />
                    </Button>
                </div>
            )}
        </div>
    );
}
