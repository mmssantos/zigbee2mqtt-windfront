import { type Endpoint, FeatureAccessMode, type TextFeature } from "../../../types.js";
import TextualEditor from "../../textual-editor/TextualEditor.js";
import BaseViewer from "../BaseViewer.js";
import NoAccessError from "../NoAccessError.js";
import type { BaseFeatureProps } from "../index.js";

type TextProps = BaseFeatureProps<TextFeature>;

export default function Text(props: TextProps) {
    const {
        feature: { access = FeatureAccessMode.SET, endpoint, property },
        deviceState,
        onChange,
    } = props;
    if (access & FeatureAccessMode.SET) {
        return (
            <TextualEditor
                onChange={(value) => onChange(endpoint as Endpoint, { [property]: value })}
                value={(deviceState[property] as string) ?? ""}
            />
        );
    }
    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }
    return <NoAccessError {...props} />;
}
