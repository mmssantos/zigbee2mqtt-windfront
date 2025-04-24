import { type BinaryFeature, type Endpoint, FeatureAccessMode } from "../../../types.js";
import Toggle from "../../toggle/Toggle.js";
import BaseViewer from "../BaseViewer.js";
import NoAccessError from "../NoAccessError.js";
import type { BaseFeatureProps } from "../index.js";

type BinaryProps = BaseFeatureProps<BinaryFeature>;

export default function Binary(props: BinaryProps) {
    const {
        feature: { access = FeatureAccessMode.ACCESS_WRITE, endpoint, name, property, value_off: valueOff, value_on: valueOn },
        deviceState,
        onChange,
        minimal,
    } = props;
    if (access & FeatureAccessMode.ACCESS_WRITE) {
        return (
            <Toggle
                onChange={(value) => onChange(endpoint as Endpoint, { [property]: value })}
                value={deviceState[property]}
                valueOn={valueOn}
                valueOff={valueOff}
                minimal={minimal}
                name={name}
            />
        );
    }
    if (access & FeatureAccessMode.ACCESS_STATE) {
        return <BaseViewer {...props} />;
    }
    return <NoAccessError {...props} />;
}
