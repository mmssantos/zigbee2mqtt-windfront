import type { ClimateFeature, WithAnySubFeatures } from "../../types.js";
import { FeatureSubFeatures } from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type ClimateProps = BaseFeatureProps<WithAnySubFeatures<ClimateFeature>>;

export default function Climate(props: ClimateProps) {
    return <FeatureSubFeatures {...props} />;
}
