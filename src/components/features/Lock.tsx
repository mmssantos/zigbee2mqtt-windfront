import type { LockFeature, WithAnySubFeatures } from "../../types.js";
import { FeatureSubFeatures } from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type LockProps = BaseFeatureProps<WithAnySubFeatures<LockFeature>>;

export default function Lock(props: LockProps) {
    return <FeatureSubFeatures {...props} />;
}
