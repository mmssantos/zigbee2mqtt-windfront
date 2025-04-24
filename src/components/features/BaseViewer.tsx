import type { GenericExposedFeature } from "../../types.js";
import { DisplayValue } from "../display-value/DisplayValue.js";
import type { BaseFeatureProps } from "./index.js";

export default function BaseViewer(props: BaseFeatureProps<GenericExposedFeature>) {
    const {
        feature: { property, unit, name },
        deviceState,
    } = props;
    return (
        <div>
            {property && (
                <strong>
                    <DisplayValue value={deviceState[property]} name={name} />
                </strong>
            )}
            {unit ? <small className="text-muted ms-1">{unit}</small> : null}
        </div>
    );
}
