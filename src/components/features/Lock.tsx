import { memo } from "react";
import type { LockFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type LockProps = BaseFeatureProps<WithAnySubFeatures<LockFeature>>;

const Lock = memo((props: LockProps) => {
    return <FeatureSubFeatures {...props} />;
});

export default Lock;
