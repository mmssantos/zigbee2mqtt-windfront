import { memo } from "react";
import type { FanFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type FanProps = BaseWithSubFeaturesProps<WithAnySubFeatures<FanFeature>>;

const Fan = memo((props: FanProps) => {
    return <FeatureSubFeatures {...props} />;
});

export default Fan;
