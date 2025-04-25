import type { CompositeFeature, GenericFeature } from "../../types.js";
import type { BaseFeatureProps } from "./index.js";

export default function NoAccessError(props: BaseFeatureProps<GenericFeature | CompositeFeature>) {
    return (
        <div className="alert alert-warning p-0" role="alert">
            Unknown access {JSON.stringify(props.feature.access, null, 4)}
        </div>
    );
}
