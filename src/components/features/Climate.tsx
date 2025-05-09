import { memo } from "react";
import type { ClimateFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type ClimateProps = BaseFeatureProps<WithAnySubFeatures<ClimateFeature>>;

const Climate = memo((props: ClimateProps) => {
    return <FeatureSubFeatures {...props} />;
});

export default Climate;
