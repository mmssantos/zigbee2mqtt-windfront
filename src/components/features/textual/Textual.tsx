import { type Endpoint, FeatureAccessMode, type TextualFeature } from "../../../types.js";
import TextualEditor from "../../textual-editor/TextualEditor.js";
import BaseViewer from "../BaseViewer.js";
import NoAccessError from "../NoAccessError.js";
import type { BaseFeatureProps } from "../index.js";

type TextualProps = BaseFeatureProps<TextualFeature>;

export default function Textual(props: TextualProps) {
    const {
        feature: { access = FeatureAccessMode.ACCESS_WRITE, endpoint, property },
        deviceState,
        onChange,
    } = props;
    if (access & FeatureAccessMode.ACCESS_WRITE) {
        return (
            <TextualEditor
                onChange={(value) => onChange(endpoint as Endpoint, { [property]: value })}
                value={(deviceState[property] as string) ?? ""}
            />
        );
    }
    if (access & FeatureAccessMode.ACCESS_STATE) {
        return <BaseViewer {...props} />;
    }
    return <NoAccessError {...props} />;
}
