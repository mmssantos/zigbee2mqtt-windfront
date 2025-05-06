import type { SwitchFeature, WithAnySubFeatures } from "../../types.js";
import { FeatureSubFeatures } from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type SwitchProps = BaseFeatureProps<WithAnySubFeatures<SwitchFeature>>;

export default function Switch(props: SwitchProps) {
    return <FeatureSubFeatures {...props} />;
}
