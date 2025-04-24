import { type Endpoint, FeatureAccessMode, type NumericFeature } from "../../../types.js";
import type { ValueWithLabelOrPrimitive } from "../../enum-editor/EnumEditor.js";
import RangeEditor from "../../range-editor/RangeEditor.js";
import BaseViewer from "../BaseViewer.js";
import NoAccessError from "../NoAccessError.js";
import type { BaseFeatureProps } from "../index.js";

interface NumericProps extends BaseFeatureProps<NumericFeature> {
    steps?: ValueWithLabelOrPrimitive[];
}

export default function Numeric(props: NumericProps) {
    const {
        feature: {
            presets,
            access = FeatureAccessMode.ACCESS_WRITE,
            endpoint,
            property,
            unit,
            value_max: valueMax,
            value_min: valueMin,
            value_step: valueStep,
        },
        deviceState,
        steps,
        onChange,
        minimal,
    } = props;

    if (access & FeatureAccessMode.ACCESS_WRITE) {
        return (
            <RangeEditor
                onChange={(value) => onChange(endpoint as Endpoint, { [property]: value })}
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

    if (access & FeatureAccessMode.ACCESS_STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
}
