import { FeatureAccessMode, type NumericFeature } from "../../types.js";
import type { ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import RangeEditor from "../editors/RangeEditor.js";
import BaseViewer from "./BaseViewer.js";
import NoAccessError from "./NoAccessError.js";
import type { BaseFeatureProps } from "./index.js";

interface NumericProps extends BaseFeatureProps<NumericFeature> {
    steps?: ValueWithLabelOrPrimitive[];
}

export default function Numeric(props: NumericProps) {
    const {
        feature: { presets, access = FeatureAccessMode.SET, property, unit, value_max: valueMax, value_min: valueMin, value_step: valueStep },
        deviceState,
        steps,
        onChange,
        minimal,
    } = props;

    if (access & FeatureAccessMode.SET) {
        return (
            <RangeEditor
                onChange={(value) => onChange({ [property]: value })}
                value={(deviceState[property] ?? "") as number}
                min={valueMin}
                max={valueMax}
                step={valueStep}
                steps={presets?.length ? (presets as ValueWithLabelOrPrimitive[]) : steps}
                unit={unit}
                minimal={minimal}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
}
