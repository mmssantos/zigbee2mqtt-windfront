import type { LightFeature } from "../../types.js";
import { scale } from "../../utils.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import { Composite } from "./Composite.js";
import type { BaseFeatureProps } from "./index.js";

type LightProps = BaseFeatureProps<LightFeature>;
const stepsConfiguration = {
    brightness: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({
        value: scale(item, [0, 100], [0, 255]),
        name: `${item}%`,
    })),
    color_temp: [1000, 2000, 3000, 4000, 5000, 6500].map<ValueWithLabelOrPrimitive>((kelvin) => ({
        value: 1000000.0 / kelvin,
        name: `${kelvin}K`,
    })),
};

export default function Light(props: LightProps) {
    return <Composite type="light" {...props} stepsConfiguration={stepsConfiguration} />;
}
