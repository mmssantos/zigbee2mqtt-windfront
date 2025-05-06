import type { BasicFeature } from "../../types.js";
import { DisplayValue } from "../value-decorators/DisplayValue.js";
import type { BaseFeatureProps } from "./index.js";

export default function BaseViewer(props: BaseFeatureProps<BasicFeature>) {
    return (
        <div>
            {props.feature.property && (
                <span className="font-bold">
                    <DisplayValue value={props.deviceState[props.feature.property]} name={props.feature.name} />
                </span>
            )}
            {"unit" in props.feature && <span className="text-xs ms-1">{props.feature.unit}</span>}
        </div>
    );
}
