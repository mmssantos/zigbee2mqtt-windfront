import type { FanFeature } from "../../types.js";
import { Composite } from "./Composite.js";
import type { BaseFeatureProps } from "./index.js";

type FanProps = BaseFeatureProps<FanFeature>;

export default function Fan(props: FanProps) {
    return <Composite type="fan" {...props} />;
}
