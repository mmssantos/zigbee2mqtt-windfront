import { type EnumFeature, FeatureAccessMode } from "../../types.js";
import EnumEditor, { type ValueWithLabelOrPrimitive } from "../editors/EnumEditor.js";
import BaseViewer from "./BaseViewer.js";
import NoAccessError from "./NoAccessError.js";
import type { BaseFeatureProps } from "./index.js";

type EnumProps = BaseFeatureProps<EnumFeature>;
const VERY_BIG_ENUM_SIZE = 4;

export default function Enum(props: EnumProps) {
    const {
        onChange,
        feature: { access = FeatureAccessMode.SET, values, endpoint, property },
        deviceState,
        minimal,
    } = props;

    const thisIsVeryBigEnumeration = values.length > VERY_BIG_ENUM_SIZE;

    if (access & FeatureAccessMode.SET) {
        return (
            <EnumEditor
                onChange={(value) => onChange(endpoint, { [property]: value })}
                values={values as unknown as ValueWithLabelOrPrimitive[]}
                value={deviceState[property] as ValueWithLabelOrPrimitive}
                minimal={minimal || thisIsVeryBigEnumeration}
            />
        );
    }

    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }

    return <NoAccessError {...props} />;
}
