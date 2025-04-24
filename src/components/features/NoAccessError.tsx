import type { CompositeFeature, GenericExposedFeature } from "../../types.js";
import type { BaseFeatureProps } from "./index.js";

export default function NoAccessError({ feature: { access } }: BaseFeatureProps<GenericExposedFeature | CompositeFeature>) {
    return (
        <div className="alert alert-warning p-0" role="alert">
            Unknown access {JSON.stringify(access, null, 4)}
        </div>
    );
}
