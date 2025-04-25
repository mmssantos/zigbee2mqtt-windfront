import type { ClimateFeature } from "../../types.js";
import { Composite } from "./Composite.js";
import type { BaseFeatureProps } from "./index.js";

type ClimateProps = BaseFeatureProps<ClimateFeature>;

export default function Climate(props: ClimateProps) {
    return <Composite type="climate" {...props} />;
}
