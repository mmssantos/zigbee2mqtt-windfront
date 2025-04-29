import { faSync } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { PropsWithChildren } from "react";
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
    const { t } = useTranslation(["featureDescriptions"]);
    const { children, feature, onRead } = props;
    const isColor = isColorFeature(feature);
    const isReadable = (feature.property && feature.access & FeatureAccessMode.GET) || isColor;

    const parentFeature = props.parentFeatures?.[props.parentFeatures.length - 1];
    let label = feature.label;

    if (parentFeature?.label && feature.name === "state" && !["light", "switch"].includes(parentFeature.type)) {
        label = `${parentFeature.label} ${feature.label.charAt(0).toLowerCase()}${feature.label.slice(1)}`;
    }

    const leftColumn = (
        <div className="col-12 col-md-3">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: tmp */}
            <label className="col-form-label w-100">
                <div className="d-flex justify-content-between">
                    <strong title={JSON.stringify(feature)}>{label}</strong>
                    {isReadable ? (
                        <Button<CompositeFeature | GenericFeature>
                            item={feature}
                            onClick={(item) => {
                                onRead({ [item.property as string]: "" });
                            }}
                            className="btn btn-sm btn-primary"
                        >
                            <FontAwesomeIcon icon={faSync} />
                        </Button>
                    ) : null}
                </div>
                {feature.description ? <small className="d-block text-muted">{t(feature.description)}</small> : null}
            </label>
        </div>
    );

    return (
        <div className="row border-bottom py-1 w-100 align-items-center">
            {(isReadable || feature.label) && leftColumn}
            <div className="col-12 col-md-9">{children}</div>
        </div>
    );
}
