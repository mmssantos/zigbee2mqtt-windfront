import type { JSX } from "react";
import type { Cluster } from "../../types.js";
import { MultiPicker } from "./MultiPicker.js";
import { SinglePicker } from "./SinglePicker.js";
import { type ClusterPickerProps, PickerType } from "./index.js";

export default function ClusterPicker(props: Readonly<ClusterPickerProps>): JSX.Element {
    const { pickerType, onChange, clusters, value, label, disabled, ...rest } = props;
    if (pickerType === PickerType.MULTIPLE) {
        return (
            <MultiPicker
                onChange={onChange}
                clusters={clusters as Cluster[]}
                value={value as Cluster[]}
                disabled={disabled}
                label={label}
                {...rest}
            />
        );
    }
    return <SinglePicker onChange={onChange} clusters={clusters as Cluster[]} value={value as Cluster} disabled={disabled} label={label} {...rest} />;
}
