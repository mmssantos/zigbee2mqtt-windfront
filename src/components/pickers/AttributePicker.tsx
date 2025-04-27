import { type ChangeEvent, type InputHTMLAttributes, type JSX, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { DataType } from "../../ZCLenums.js";
import { useAppSelector } from "../../hooks/useApp.js";
import type { Cluster, Device } from "../../types.js";
import SelectField from "../form-fields/SelectField.js";

export interface AttributeDefinition {
    ID: number;
    type: DataType;
    manufacturerCode?: number;
}

interface AttributePickerProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, "onChange"> {
    cluster: Cluster;
    device: Device;
    label?: string;
    onChange: (attr: string, definition: AttributeDefinition) => void;
}

export default function AttributePicker(props: AttributePickerProps): JSX.Element {
    const { cluster, device, onChange, label, ...rest } = props;
    const bridgeDefinitions = useAppSelector((state) => state.bridgeDefinitions);
    const { t } = useTranslation("zigbee");

    // retrieve cluster attributes, priority to ZH, then device custom if any
    const clusterAttributes = useMemo(() => {
        const stdCluster = bridgeDefinitions.clusters[cluster];

        if (stdCluster) {
            return stdCluster.attributes;
        }

        const deviceCustomClusters = bridgeDefinitions.custom_clusters[device.ieee_address];

        if (deviceCustomClusters) {
            const customClusters = deviceCustomClusters[cluster];

            if (customClusters) {
                return customClusters.attributes;
            }
        }

        return [];
    }, [bridgeDefinitions, device.ieee_address, cluster]);

    const options = useMemo(() => {
        const attrs: JSX.Element[] = [];

        for (const key in clusterAttributes) {
            attrs.push(
                <option key={key} value={key}>
                    {key}
                </option>,
            );
        }

        return attrs;
    }, [clusterAttributes]);

    return (
        <SelectField
            name="attribute_picker"
            label={label}
            onChange={(e: ChangeEvent<HTMLSelectElement>): void => onChange(e.target.value, clusterAttributes[e.target.value])}
            disabled={options.length === 0}
            {...rest}
        >
            <option value="" disabled>
                {t("select_attribute")}
            </option>
            {options}
        </SelectField>
    );
}
