import type { FanFeature, WithAnySubFeatures } from "../../types.js";
import { FeatureSubFeatures } from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type FanProps = BaseFeatureProps<WithAnySubFeatures<FanFeature>>;

export default function Fan(props: FanProps) {
    return <FeatureSubFeatures {...props} />;
}
