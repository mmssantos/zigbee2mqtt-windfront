import type { LockFeature } from "../../types.js";
import { Composite } from "./Composite.js";
import type { BaseFeatureProps } from "./index.js";

type LockProps = BaseFeatureProps<LockFeature>;

export default function Lock(props: LockProps) {
    return <Composite {...props} />;
}
