import { memo } from "react";
import type { CoverFeature, WithAnySubFeatures } from "../../types.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import FeatureSubFeatures from "./FeatureSubFeatures.js";
import type { BaseFeatureProps } from "./index.js";

const STEPS_CONFIG = {
    position: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({ value: item, name: `${item}` })),
    tilt: [0, 25, 50, 75, 100].map<ValueWithLabelOrPrimitive>((item) => ({ value: item, name: `${item}` })),
};

type CoverProps = BaseFeatureProps<WithAnySubFeatures<CoverFeature>>;

const Cover = memo((props: CoverProps) => {
    return <FeatureSubFeatures {...props} steps={STEPS_CONFIG} />;
});

export default Cover;
