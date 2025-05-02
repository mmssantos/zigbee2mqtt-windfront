import type { AnyColor, ColorFeature } from "../../types.js";
import ColorEditor from "../editors/ColorEditor.js";
import type { BaseFeatureProps } from "./index.js";

type ColorProps = BaseFeatureProps<ColorFeature>;

export default function Color(props: ColorProps) {
    const { deviceState, feature, onChange, minimal } = props;
    const value = {} as AnyColor;

    for (const innerFeature of feature.features) {
        value[innerFeature.name] = deviceState[feature.property]?.[innerFeature.property] ?? 0;
    }

    return <ColorEditor onChange={(color) => onChange({ color })} value={value} format={feature.name} minimal={minimal} />;
}
