import { memo } from "react";
import type { SwitchFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseWithSubFeaturesProps } from "./index.js";

type SwitchProps = BaseWithSubFeaturesProps<WithAnySubFeatures<SwitchFeature>>;

const Switch = memo((props: SwitchProps) => {
    return <FeatureSubFeatures {...props} />;
});

export default Switch;
