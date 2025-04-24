import type { ChangeEvent, JSX } from "react";
import { type MultiPickerProps, clusterDescriptions, isClusterGroup } from "./index.js";

export function MultiPicker(props: MultiPickerProps): JSX.Element {
    const { clusters = [], onChange, label, value, disabled } = props;

    let options = [] as JSX.Element[];
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { checked: isChecked, name } = e.target;
        let newVal = [...value];
        if (isChecked) {
            newVal.push(name);
        } else {
            newVal = newVal.filter((v) => v !== name);
        }
        onChange(newVal);
    };

    if (isClusterGroup(clusters)) {
        console.warn("Not implemented");
    } else {
        options = [...clusters]
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
                    {clusterDescriptions[cluster] ?? cluster}
                </label>
            ));
    }

    return (
        <fieldset className="fieldset">
            {label && <legend className="fieldset-legend">{label}</legend>}
            <div className="flex flex-row flex-row gap-2">{options}</div>
        </fieldset>
    );
}
