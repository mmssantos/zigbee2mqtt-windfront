import type { ChangeEvent, InputHTMLAttributes, JSX } from "react";
import { useTranslation } from "react-i18next";
import type { DataType } from "../../ZCLenums.js";
import { useAppSelector } from "../../hooks/store.js";
import type { Attribute, Cluster, Device } from "../../types.js";
import { SelectField } from "../form-fields/SelectField.js";

export interface AttributeDefinition {
    ID: number;
    type: DataType;
    manufacturerCode?: number;
}

interface AttributePickerProps {
    cluster: Cluster;
    device: Device;
    value: Attribute;
    label?: string;
    onChange: (attr: Attribute, definition: AttributeDefinition) => void;
}

export default function AttributePicker(props: AttributePickerProps & Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange">): JSX.Element {
    const { cluster, device, onChange, label, value, ...rest } = props;
    const bridgeDefinition = useAppSelector((state) => state.bridgeDefinition);
    const { t } = useTranslation("zigbee");
    const onChangeHandler = (e: ChangeEvent<HTMLSelectElement>): void => {
        const { value: inputValue } = e.target;
        const attrs = getClusterAttributes(cluster);
        const attributeInfo = attrs[inputValue];

        // inputValue could be "Select attribute" which isn't a proper cluster attribute
        if (attributeInfo) {
            onChange(inputValue, attributeInfo);
        }
    };
    // Retrieve Cluster attributes: from ZH first, then from device definition
    const getClusterAttributes = (clusterKey: Cluster): string[] | Readonly<Record<string, Readonly<AttributeDefinition>>> => {
        // If the clusters definition have been passed as attribute (for example for testing), we use it
        // Otherwise we retrieve from the store state

        // Cluster name is part of the default definition
        if (clusterKey in bridgeDefinition.clusters) {
            const cluster = bridgeDefinition.clusters[clusterKey];

            if (cluster && Object.keys(cluster).length !== 0) {
                return cluster.attributes;
            }
        } // Or the cluster name is part the clustom cluster of the device
        else if (
            device.ieee_address in bridgeDefinition.custom_clusters &&
            Object.hasOwn(bridgeDefinition.custom_clusters[device.ieee_address], clusterKey)
        ) {
            const CustomClusters = bridgeDefinition.custom_clusters[device.ieee_address][clusterKey];

            if (CustomClusters && Object.keys(CustomClusters).length !== 0) {
                return CustomClusters.attributes;
            }
        }

        // Return empty if no matches found
        return [];
    };
    const attrs = Object.keys(getClusterAttributes(cluster));

    if (value != null && !attrs.includes(value)) {
        attrs.push(value);
    }
    const options = attrs.map((attr) => (
        <option key={attr} value={attr}>
            {attr}
        </option>
    ));
    options.unshift(
        <option key="none" hidden>
            {t("select_attribute")}
        </option>,
    );
    return (
        <SelectField name="attribute_picker" label={label} defaultValue={value} onChange={onChangeHandler} disabled={attrs.length === 0} {...rest}>
            {options}
        </SelectField>
    );
}
