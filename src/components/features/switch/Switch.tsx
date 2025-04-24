import type { SwitchFeature } from "../../../types.js";
import { Composite } from "../composite/Composite.js";
import type { BaseFeatureProps } from "../index.js";

type SwitchProps = BaseFeatureProps<SwitchFeature>;

export default function Switch(props: SwitchProps) {
    return <Composite type="switch" {...props} />;
}
