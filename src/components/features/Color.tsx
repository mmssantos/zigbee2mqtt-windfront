import type { AnyColor, ColorFeature, Endpoint } from "../../types.js";
import ColorEditor from "../editors/ColorEditor.js";
import type { BaseFeatureProps } from "./index.js";

type ColorProps = BaseFeatureProps<ColorFeature>;

export default function Color(props: ColorProps) {
    const { deviceState, feature, onChange, minimal } = props;
    const value = {};

    for (const innerFeature of feature.features) {
        value[innerFeature.name] = (deviceState[feature.property] as Record<string, Record<string, unknown>>)?.[innerFeature.property] ?? 0;
    }

    return (
        <ColorEditor
            onChange={(color) => onChange(feature.endpoint as Endpoint, { color })}
            value={value as AnyColor}
            format={feature.name}
            minimal={minimal}
        />
    );
}
