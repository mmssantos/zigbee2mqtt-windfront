import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { TabName } from "../../pages/DevicePage.js";
import type { RootState } from "../../store.js";
import type { Device } from "../../types.js";
import { PopoverDropdown } from "../dropdown/PopoverDropdown.js";

interface HeaderDeviceSelectorProps {
    devices: RootState["devices"];
    currentDevice: Device | undefined;
    tab?: TabName;
}

export function HeaderDeviceSelector(props: HeaderDeviceSelectorProps): JSX.Element {
    const { devices, currentDevice, tab = "info" } = props;
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { t } = useTranslation("devicePage");
    const items = useMemo(
        () =>
            devices
                .filter(
                    (device) =>
                        device.type !== "Coordinator" &&
                        device.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        device.ieee_address !== currentDevice?.ieee_address,
                )
                .map((device) => (
                    <li key={device.ieee_address}>
                        <Link to={`/device/${device.ieee_address}/${tab}`} onClick={() => setSearchTerm("")} className="dropdown-item">
                            {device.friendly_name}
                        </Link>
                    </li>
                )),
        [devices, currentDevice, searchTerm, tab],
    );

    return (
        <PopoverDropdown
            name="header-device-selector"
            buttonChildren={`${currentDevice?.friendly_name || t("unknown_device")}`}
            dropdownStyle="dropdown-start"
        >
            <label className="input" key="search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input type="search" placeholder={t("type_to_filter")} onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
            </label>
            {items}
        </PopoverDropdown>
    );
}
