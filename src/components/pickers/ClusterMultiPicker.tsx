import { type ChangeEvent, type JSX, useCallback, useMemo } from "react";
import type { CheckboxFieldProps } from "../form-fields/CheckboxField.js";
import { isClusterGroup } from "./index.js";

export interface ClusterMultiPickerProps extends Omit<CheckboxFieldProps, "onChange"> {
    clusters: Set<string>;
    value: string[];
    onChange(clusters: string[] | undefined): void;
}

export default function ClusterMultiPicker(props: ClusterMultiPickerProps): JSX.Element {
    const { clusters = [], onChange, label, value, disabled } = props;

    const onChangeHandler = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { checked: isChecked, name } = e.target;
            let newVal = [...value];

            if (isChecked) {
                newVal.push(name);
            } else {
                newVal = newVal.filter((v) => v !== name);
            }

            onChange(newVal);
        },
        [onChange, value],
    );

    const options = useMemo(() => {
        if (isClusterGroup(clusters)) {
            console.warn("Not implemented");
            return [];
        }

        return Array.from(clusters)
            .sort((a, b) => a.toString().localeCompare(b.toString()))
            .map((cluster) => (
                <label key={cluster} className="label" title={cluster as string}>
                    <input
                        className="checkbox"
                        type="checkbox"
                        checked={value.includes(cluster)}
                        name={cluster as string}
                        value={cluster}
                        onChange={onChangeHandler}
                        disabled={disabled}
                    />
                    {cluster}
                </label>
            ));
    }, [clusters, onChangeHandler, value, disabled]);

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <div className="flex flex-row flex-row gap-2">{options}</div>
        </fieldset>
    );
}
