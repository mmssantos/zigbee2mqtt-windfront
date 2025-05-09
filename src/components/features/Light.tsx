import { memo } from "react";
import type { LightFeature, WithAnySubFeatures } from "../../types.js";
import { scale } from "../../utils.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

type LightProps = BaseFeatureProps<WithAnySubFeatures<LightFeature>>;

const STEPS_CONFIG = {
    brightness: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({
        value: scale(item, [0, 100], [0, 255]),
        name: `${item}%`,
    })),
    color_temp: [1000, 2000, 3000, 4000, 5000, 6500].map<ValueWithLabelOrPrimitive>((kelvin) => ({
        value: 1000000.0 / kelvin,
        name: `${kelvin}K`,
    })),
};

const Light = memo((props: LightProps) => {
    return <FeatureSubFeatures {...props} steps={STEPS_CONFIG} />;
});

export default Light;
