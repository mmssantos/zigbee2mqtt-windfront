import { memo } from "react";
import type { LockFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type LockProps = BaseWithSubFeaturesProps<WithAnySubFeatures<LockFeature>>;

const Lock = memo((props: LockProps) => {
    return <FeatureSubFeatures {...props} />;
});

export default Lock;
