import type { CoverFeature } from "../../types.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import { Composite } from "./Composite.js";
import type { BaseFeatureProps } from "./index.js";

const stepsConfiguration = {
    position: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({ value: item, name: `${item}` })),
    tilt: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({ value: item, name: `${item}` })),
};

type CoverProps = BaseFeatureProps<CoverFeature>;

export default function Cover(props: CoverProps) {
    return <Composite type="cover" {...props} stepsConfiguration={stepsConfiguration} />;
}
