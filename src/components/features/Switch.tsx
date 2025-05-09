import { memo } from "react";
import type { SwitchFeature, WithAnySubFeatures } from "../../types.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type SwitchProps = BaseFeatureProps<WithAnySubFeatures<SwitchFeature>>;

const Switch = memo((props: SwitchProps) => {
    return <FeatureSubFeatures {...props} />;
});

export default Switch;
