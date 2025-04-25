import { FeatureAccessMode, type TextFeature } from "../../types.js";
import TextEditor from "../editors/TextEditor.js";
import BaseViewer from "./BaseViewer.js";
import NoAccessError from "./NoAccessError.js";
import type { BaseFeatureProps } from "./index.js";

type TextProps = BaseFeatureProps<TextFeature>;

export default function Text(props: TextProps) {
    const {
        feature: { access = FeatureAccessMode.SET, endpoint, property },
        deviceState,
        onChange,
    } = props;
    if (access & FeatureAccessMode.SET) {
        return <TextEditor onChange={(value) => onChange(endpoint, { [property]: value })} value={(deviceState[property] as string) ?? ""} />;
    }
    if (access & FeatureAccessMode.STATE) {
        return <BaseViewer {...props} />;
    }
    return <NoAccessError {...props} />;
}
