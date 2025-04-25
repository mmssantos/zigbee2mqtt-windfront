import type { ChangeEvent, SelectHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import type { WithDevices } from "../../store.js";
import type { Device, EntityType, Group } from "../../types.js";
import { getDeviceDisplayName } from "../../utils.js";
import { SelectField } from "../form-fields/SelectField.js";

interface DevicePickerProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange">, WithDevices {
    value: string | number;
    label?: string;
    groups?: Group[];
    onChange(device: Device | Group, type: EntityType): void;
}

export default function DevicePicker(props: DevicePickerProps) {
    const { t } = useTranslation("common");
    const { devices, value, label, onChange, groups = [], ...rest } = props;

    const onSelectHandler = (e: ChangeEvent<HTMLSelectElement>): void => {
        const { value: selectedValue } = e.target as HTMLSelectElement;
        if (devices[selectedValue]) {
            onChange(devices[selectedValue], "device");
        } else {
            const group = groups.find((g) => Number.parseInt(selectedValue, 10) === g.id);
            onChange(group as Group, "group");
        }
    };
    const options = [
        <option key="hidden" hidden>
            {t("select_device")}
        </option>,
    ];
    const devicesOptions = Object.values(devices)
        .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
        .map((device) => (
            <option title={device.definition?.description} key={device.ieee_address} value={device.ieee_address}>
                {getDeviceDisplayName(device)}
            </option>
        ));

    if (groups?.length) {
        const groupOptions = [...groups]
            .sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
            .map((group) => (
                <option key={group.friendly_name} value={group.id}>
                    {group.friendly_name}
                </option>
            ));
        options.push(
            <optgroup key="Groups" label={t("groups")}>
                {groupOptions}
            </optgroup>,
        );
        options.push(
            <optgroup key="Devices" label={t("devices")}>
                {devicesOptions}
            </optgroup>,
        );
    } else {
        options.push(...devicesOptions);
    }

    return (
        <SelectField name="device_picker" label={label} defaultValue={value} onChange={onSelectHandler} {...rest}>
            {options}
        </SelectField>
    );
}
