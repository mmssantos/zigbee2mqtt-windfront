import { memo } from "react";
import { type EnumFeature, FeatureAccessMode } from "../../types.js";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import BaseViewer from "./BaseViewer.js";
import NoAccessError from "./NoAccessError.js";
import type { BaseFeatureProps } from "./index.js";

type EnumProps = BaseFeatureProps<EnumFeature>;
const BIG_ENUM_SIZE = 6;

const Enum = memo((props: EnumProps) => {
    const {
        onChange,
        feature: { access = FeatureAccessMode.SET, values, property },
        deviceState,
        minimal,
    } = props;

    if (access & FeatureAccessMode.SET) {
        return (
            <EnumEditor
                onChange={(value) => onChange({ [property]: value })}
                values={values}
                value={(deviceState[property] as ValueWithLabelOrPrimitive) || ""}
                minimal={minimal || values.length > BIG_ENUM_SIZE}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
});

export default Enum;
