import type { ChangeEvent, JSX } from "react";
import { useTranslation } from "react-i18next";
import { SelectField } from "../form-fields/SelectField.js";
import { CLUSTER_DESCRIPTIONS, type ClusterSinglePickerProps, isClusterGroup } from "./index.js";

export default function ClusterSinglePicker(props: ClusterSinglePickerProps): JSX.Element {
    const { clusters = [], onChange, value, label, disabled, ...rest } = props;
    const { t } = useTranslation(["zigbee", "common"]);
    const options = [
        <option key="hidden" hidden>
            {t("select_cluster")}
        </option>,
    ];

    const onChangeHandler = (e: ChangeEvent<HTMLSelectElement>): void => {
        onChange(e.target.value);
    };

    if (isClusterGroup(clusters)) {
        for (const group of clusters) {
            const groupOptions: JSX.Element[] = [];

            for (const cluster of group.clusters) {
                groupOptions.push(
                    <option key={cluster} value={cluster}>
                        {CLUSTER_DESCRIPTIONS[cluster] ?? cluster}
                    </option>,
                );
            }

            if (groupOptions.length === 0) {
                groupOptions.push(
                    <option key="none" disabled>
                        {t("none")}
                    </option>,
                );
            }

            options.push(
                <optgroup key={group.name} label={t(group.name)}>
                    {groupOptions}
                </optgroup>,
            );
        }
    } else {
        for (const cluster of clusters) {
            options.push(
                <option key={cluster} value={cluster}>
                    {CLUSTER_DESCRIPTIONS[cluster] ?? cluster}
                </option>,
            );
        }
    }

    return (
        <SelectField name="attribute_picker" label={label} defaultValue={value} onChange={onChangeHandler} disabled={disabled} {...rest}>
            {options}
        </SelectField>
    );
}
