import type { GenericFeature } from "../../types.js";
import { DisplayValue } from "../value-decorators/DisplayValue.js";
import type { BaseFeatureProps } from "./index.js";

export default function BaseViewer(props: BaseFeatureProps<GenericFeature>) {
    return (
        <div>
            {props.feature.property && (
                <strong>
                    <DisplayValue value={props.deviceState[props.feature.property]} name={props.feature.name} />
                </strong>
            )}
            {"unit" in props.feature && <small className="text-muted ms-1">{props.feature.unit}</small>}
        </div>
    );
}
