import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import camelCase from "lodash/camelCase.js";
import startCase from "lodash/startCase.js";
import { type PropsWithChildren, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FeatureWrapperProps } from "../features/FeatureWrapper.js";
import { getGenericFeatureIcon } from "../features/index.js";

export default function DashboardFeatureWrapper(props: PropsWithChildren<FeatureWrapperProps>) {
    const { children, feature, deviceState = {} } = props;
    const fi = useMemo(
        () => getGenericFeatureIcon(feature.name, deviceState[feature.property!], "unit" in feature ? feature.unit : undefined),
        [feature, deviceState],
    );
    const { t } = useTranslation(["featureNames"]);
    const featureName = feature.name === "state" ? feature.property : feature.name;
    const fallbackFeatureName = startCase(camelCase(featureName));

    return (
        <div className="flex flex-row items-center gap-1 mb-2">
            {fi && <FontAwesomeIcon icon={fi[0]} fixedWidth className={fi[1]} {...fi[2]} />}
            <div className="flex-grow-1">
                {t(featureName!, { defaultValue: fallbackFeatureName })}
                {feature.endpoint ? ` (${feature.endpoint})` : null}
            </div>
            <div className="flex-shrink-1">{children}</div>
        </div>
    );
}
