import type { JSX } from "react";
import type { Cluster } from "../../types.js";
import ClusterMultiPicker from "./ClusterMultiPicker.js";
import ClusterSinglePicker from "./ClusterSinglePicker.js";
import { type ClusterPickerProps, ClusterPickerType } from "./index.js";

export default function ClusterPicker(props: Readonly<ClusterPickerProps>): JSX.Element {
    const { pickerType, onChange, clusters, value, label, disabled, ...rest } = props;
    if (pickerType === ClusterPickerType.MULTIPLE) {
        return (
            <ClusterMultiPicker
                onChange={onChange}
                clusters={clusters as Cluster[]}
                value={value as Cluster[]}
                disabled={disabled}
                label={label}
                {...rest}
            />
        );
    }
    return (
        <ClusterSinglePicker
            onChange={onChange}
            clusters={clusters as Cluster[]}
            value={value as Cluster}
            disabled={disabled}
            label={label}
            {...rest}
        />
    );
}
