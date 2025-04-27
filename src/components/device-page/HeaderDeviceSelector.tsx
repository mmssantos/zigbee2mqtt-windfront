import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type JSX, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { WithDevices } from "../../store.js";
import type { Device } from "../../types.js";
import { PopoverDropdown } from "../dropdown/PopoverDropdown.js";
import type { TabName } from "./index.js";

interface HeaderDeviceSelectorProps {
    allDevices: WithDevices["devices"];
    currentDevice: Device;
    tab?: TabName;
}

interface HeaderDeviceSelectorItemsProps {
    devices: Device[];
    currentDevice: Device;
    tab?: TabName;
    setSearchTerm: (value: string) => void;
}

function HeaderDeviceSelectorItems({ devices, currentDevice, tab, setSearchTerm }: HeaderDeviceSelectorItemsProps): JSX.Element {
    return (
        <>
            {Object.values(devices).map((listDevice) => (
                <Link
                    key={listDevice.ieee_address}
                    to={`#/device/${listDevice.ieee_address}/${tab}`}
                    onClick={() => setSearchTerm("")}
                    className={currentDevice.ieee_address === listDevice.ieee_address ? "link link-hover active" : "link link-hover"}
                >
                    {listDevice.friendly_name}
                </Link>
            ))}
        </>
    );
}

export function HeaderDeviceSelector(props: HeaderDeviceSelectorProps): JSX.Element {
    const { allDevices, currentDevice, tab = "info" } = props;
    const [searchTerm, setSearchTerm] = useState<string>("");
    const { t } = useTranslation("devicePage");

    const selectedDevices = Object.values(allDevices).filter(
        (d) => d.friendly_name.toLowerCase().includes(searchTerm.toLowerCase()) && d.ieee_address !== currentDevice.ieee_address,
    );

    return (
        <PopoverDropdown name="header-device-selector" buttonChildren={`${currentDevice.friendly_name} `}>
            <label className="input" key="search">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input type="search" placeholder={t("type_to_filter")} onChange={(e) => setSearchTerm(e.target.value)} value={searchTerm} />
            </label>
            <HeaderDeviceSelectorItems devices={selectedDevices} currentDevice={currentDevice} tab={tab} setSearchTerm={setSearchTerm} />
        </PopoverDropdown>
    );
}
